import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { sendAlertEmail, sendSOSNotification } from "./emailService";
import { 
  insertVictimSchema, 
  insertRescueTeamSchema, 
  insertShelterSchema, 
  insertDisasterPredictionSchema, 
  insertAlertSchema,
  type WebSocketMessage
} from "@shared/schema";
import { z } from "zod";

// WebSocket clients
let clients: WebSocket[] = [];

// Broadcast message to all connected clients
const broadcastMessage = (message: WebSocketMessage) => {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    clients.push(ws);
    
    // Send initial data to new client
    const sendInitialData = async () => {
      try {
        const predictions = await storage.getDisasterPredictions();
        const activeAlerts = await storage.getAlerts(true);
        const teams = await storage.getRescueTeams();
        const victims = await storage.getVictims();
        const shelters = await storage.getShelters();
        
        ws.send(JSON.stringify({
          type: 'initial_data',
          payload: {
            predictions,
            activeAlerts,
            teams,
            victims,
            shelters
          }
        }));
      } catch (error) {
        console.error('Error sending initial data:', error);
      }
    };
    
    sendInitialData();
    
    ws.on('message', async (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString()) as WebSocketMessage;
        
        switch (parsedMessage.type) {
          case 'sos':
            // Handle SOS message
            const newVictim = await storage.createVictim({
              userId: parsedMessage.payload.userId,
              status: 'pending',
              sosType: parsedMessage.payload.sosType,
              location: parsedMessage.payload.location,
              additionalInfo: parsedMessage.payload.additionalInfo
            });
            
            // Broadcast to all clients
            broadcastMessage({
              type: 'new_sos',
              payload: newVictim
            });
            break;
            
          case 'team_assignment':
            // Handle team assignment
            const { victimId, teamId } = parsedMessage.payload;
            const updatedVictim = await storage.updateVictimStatus(victimId, 'assigned', teamId);
            const team = await storage.updateRescueTeamStatus(teamId, 'busy');
            
            if (updatedVictim && team) {
              broadcastMessage({
                type: 'team_assigned',
                payload: {
                  victim: updatedVictim,
                  team
                }
              });
            }
            break;
            
          case 'team_location_update':
            // Handle team location update
            const updatedTeam = await storage.updateRescueTeamLocation(
              parsedMessage.payload.teamId, 
              parsedMessage.payload.location
            );
            
            if (updatedTeam) {
              broadcastMessage({
                type: 'team_location_updated',
                payload: updatedTeam
              });
            }
            break;
            
          case 'victim_rescued':
            // Handle victim rescued
            const rescuedVictim = await storage.updateVictimStatus(
              parsedMessage.payload.victimId, 
              'rescued'
            );
            
            if (rescuedVictim && rescuedVictim.assignedTeamId) {
              const rescueTeam = await storage.updateRescueTeamStatus(
                rescuedVictim.assignedTeamId, 
                'available'
              );
              
              broadcastMessage({
                type: 'victim_rescued',
                payload: {
                  victim: rescuedVictim,
                  team: rescueTeam
                }
              });
            }
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients = clients.filter(client => client !== ws);
    });
  });
  
  // REST API Routes
  
  // Victims API
  app.get("/api/victims", async (req: Request, res: Response) => {
    try {
      const victims = await storage.getVictims();
      res.json(victims);
    } catch (error) {
      res.status(500).json({ message: "Failed to get victims" });
    }
  });
  
  app.get("/api/victims/:id", async (req: Request, res: Response) => {
    try {
      const victim = await storage.getVictim(Number(req.params.id));
      if (!victim) {
        return res.status(404).json({ message: "Victim not found" });
      }
      res.json(victim);
    } catch (error) {
      res.status(500).json({ message: "Failed to get victim" });
    }
  });
  
  app.post("/api/victims", async (req: Request, res: Response) => {
    try {
      const validatedData = insertVictimSchema.parse(req.body);
      const victim = await storage.createVictim(validatedData);
      
      // Broadcast new victim SOS
      broadcastMessage({
        type: 'new_sos',
        payload: victim
      });
      
      res.status(201).json(victim);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create victim" });
    }
  });
  
  // Rescue Teams API
  app.get("/api/rescue-teams", async (req: Request, res: Response) => {
    try {
      const teams = await storage.getRescueTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to get rescue teams" });
    }
  });
  
  app.get("/api/rescue-teams/:id", async (req: Request, res: Response) => {
    try {
      const team = await storage.getRescueTeam(Number(req.params.id));
      if (!team) {
        return res.status(404).json({ message: "Rescue team not found" });
      }
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to get rescue team" });
    }
  });
  
  app.post("/api/rescue-teams", async (req: Request, res: Response) => {
    try {
      const validatedData = insertRescueTeamSchema.parse(req.body);
      const team = await storage.createRescueTeam(validatedData);
      res.status(201).json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create rescue team" });
    }
  });
  
  app.patch("/api/rescue-teams/:id/status", async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const team = await storage.updateRescueTeamStatus(Number(req.params.id), status);
      if (!team) {
        return res.status(404).json({ message: "Rescue team not found" });
      }
      
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to update rescue team status" });
    }
  });
  
  app.patch("/api/rescue-teams/:id/location", async (req: Request, res: Response) => {
    try {
      const { location } = req.body;
      if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        return res.status(400).json({ message: "Valid location with lat and lng is required" });
      }
      
      const team = await storage.updateRescueTeamLocation(Number(req.params.id), location);
      if (!team) {
        return res.status(404).json({ message: "Rescue team not found" });
      }
      
      // Broadcast location update
      broadcastMessage({
        type: 'team_location_updated',
        payload: team
      });
      
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to update rescue team location" });
    }
  });
  
  // Shelters API
  app.get("/api/shelters", async (req: Request, res: Response) => {
    try {
      const shelters = await storage.getShelters();
      res.json(shelters);
    } catch (error) {
      res.status(500).json({ message: "Failed to get shelters" });
    }
  });
  
  app.get("/api/shelters/:id", async (req: Request, res: Response) => {
    try {
      const shelter = await storage.getShelter(Number(req.params.id));
      if (!shelter) {
        return res.status(404).json({ message: "Shelter not found" });
      }
      res.json(shelter);
    } catch (error) {
      res.status(500).json({ message: "Failed to get shelter" });
    }
  });
  
  app.post("/api/shelters", async (req: Request, res: Response) => {
    try {
      const validatedData = insertShelterSchema.parse(req.body);
      const shelter = await storage.createShelter(validatedData);
      res.status(201).json(shelter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create shelter" });
    }
  });
  
  app.patch("/api/shelters/:id/occupancy", async (req: Request, res: Response) => {
    try {
      const { occupancy } = req.body;
      if (typeof occupancy !== 'number' || occupancy < 0) {
        return res.status(400).json({ message: "Valid occupancy number is required" });
      }
      
      const shelter = await storage.updateShelterOccupancy(Number(req.params.id), occupancy);
      if (!shelter) {
        return res.status(404).json({ message: "Shelter not found" });
      }
      res.json(shelter);
    } catch (error) {
      res.status(500).json({ message: "Failed to update shelter occupancy" });
    }
  });
  
  // Disaster Predictions API
  app.get("/api/predictions", async (req: Request, res: Response) => {
    try {
      const predictions = await storage.getDisasterPredictions();
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get disaster predictions" });
    }
  });
  
  app.get("/api/predictions/:id", async (req: Request, res: Response) => {
    try {
      const prediction = await storage.getDisasterPrediction(Number(req.params.id));
      if (!prediction) {
        return res.status(404).json({ message: "Prediction not found" });
      }
      res.json(prediction);
    } catch (error) {
      res.status(500).json({ message: "Failed to get prediction" });
    }
  });
  
  app.post("/api/predictions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertDisasterPredictionSchema.parse(req.body);
      const prediction = await storage.createDisasterPrediction(validatedData);
      
      // Broadcast new prediction
      broadcastMessage({
        type: 'new_prediction',
        payload: prediction
      });
      
      res.status(201).json(prediction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create prediction" });
    }
  });
  
  // Alerts API
  app.get("/api/alerts", async (req: Request, res: Response) => {
    try {
      const active = req.query.active === 'true' ? true : 
                    req.query.active === 'false' ? false : 
                    undefined;
      
      const alerts = await storage.getAlerts(active);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get alerts" });
    }
  });
  
  app.get("/api/alerts/:id", async (req: Request, res: Response) => {
    try {
      const alert = await storage.getAlert(Number(req.params.id));
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to get alert" });
    }
  });
  
  app.post("/api/alerts", async (req: Request, res: Response) => {
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      
      // Broadcast new alert
      broadcastMessage({
        type: 'new_alert',
        payload: alert
      });
      
      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create alert" });
    }
  });
  
  app.patch("/api/alerts/:id/deactivate", async (req: Request, res: Response) => {
    try {
      const alert = await storage.deactivateAlert(Number(req.params.id));
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      // Broadcast alert deactivation
      broadcastMessage({
        type: 'alert_deactivated',
        payload: alert
      });
      
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to deactivate alert" });
    }
  });
  
  // AI Prediction Simulation with Ensemble Models (would use actual ML models in production)
  app.post("/api/simulate/prediction", async (req: Request, res: Response) => {
    try {
      const { disasterType, region, sourceData, useEnsemble, confidenceThreshold } = req.body;
      
      if (!disasterType || !region) {
        return res.status(400).json({ message: "Disaster type and region are required" });
      }
      
      // Generate a simulated prediction using ensemble model approach for 2025
      let riskLevel = 0;
      let confidence = 0;
      
      if (useEnsemble) {
        // Simulating 3 different models with different specializations
        const primaryModel = {
          riskLevel: Math.random(),
          confidence: 0.80 + (Math.random() * 0.15),
          source: 'primary-model'
        };
        
        const regionalModel = {
          riskLevel: Math.random(),
          confidence: 0.82 + (Math.random() * 0.12),
          source: 'region-specialized-model'
        };
        
        const historicalModel = {
          riskLevel: Math.random(),
          confidence: 0.75 + (Math.random() * 0.20),
          source: 'historical-pattern-model'
        };
        
        // Ensemble technique: weighted average based on confidence
        const models = [primaryModel, regionalModel, historicalModel];
        const totalConfidence = models.reduce((sum, model) => sum + model.confidence, 0);
        
        // Calculate weighted risk level and confidence
        riskLevel = models.reduce(
          (risk, model) => risk + (model.riskLevel * (model.confidence / totalConfidence)), 
          0
        );
        
        confidence = models.reduce(
          (conf, model) => conf + (model.confidence * (model.confidence / totalConfidence)), 
          0
        );
        
        // Add ensemble details to source data
        sourceData = {
          ...sourceData,
          ensemble: {
            models: models,
            ensembleMethod: 'weighted-confidence',
            timestamp: new Date().toISOString()
          }
        };
      } else {
        // Legacy single model simulation
        riskLevel = Math.random();
        confidence = 0.7 + (Math.random() * 0.25);
      }
      
      // Determine severity based on risk level
      let severity = "low";
      if (riskLevel > 0.7) severity = "high";
      else if (riskLevel > 0.4) severity = "medium";
      
      // For 2025: more varied timeframes for prediction and more precise predictions
      const timeframes = [
        "immediate", "2 hours", "4 hours", "6 hours", "8 hours", 
        "12 hours", "18 hours", "24 hours", "36 hours", "48 hours"
      ];
      const predictedTimeframe = timeframes[Math.floor(Math.random() * timeframes.length)];
      
      // Enhanced descriptions for more actionable intelligence
      let description = "";
      if (disasterType === "flood") {
        if (severity === "high") {
          description = `Expected heavy rainfall in next ${predictedTimeframe}. Recommend evacuation of low-lying areas. Water levels rising rapidly in ${region}.`;
        } else if (severity === "medium") {
          description = `Moderate rainfall expected in ${region}. Monitor water levels and prepare for possible evacuation in flood-prone areas.`;
        } else {
          description = `Light rainfall predicted. Low flood risk in ${region}, but continue monitoring weather updates.`;
        }
      } else if (disasterType === "earthquake") {
        if (severity === "high") {
          description = `High seismic activity detected. Significant earthquake risk in ${region}. Prepare for strong tremors within ${predictedTimeframe}.`;
        } else if (severity === "medium") {
          description = `Mild tremors detected in ${region} region. Pattern recognition suggests low probability of major event.`;
        } else {
          description = `Minor seismic activity. Continuous monitoring recommended in ${region}.`;
        }
      } else if (disasterType === "wildfire") {
        if (severity === "high") {
          description = `Extreme fire risk due to high temperatures and dry conditions in ${region}. Evacuation may be necessary in ${predictedTimeframe}.`;
        } else if (severity === "medium") {
          description = `Elevated fire risk in ${region}. Avoid activities that could spark fires and maintain vigilance.`;
        } else {
          description = `Standard fire precautions recommended in ${region}. Current risk is low but subject to change with weather conditions.`;
        }
      } else {
        description = `AI-generated ${severity} risk prediction for ${disasterType} in ${region}. Confidence level: ${Math.round(confidence * 100)}%.`;
      }
      
      // More detailed affected areas for better resource planning
      const affectedAreas = [region];
      
      // For high severity, add adjacent areas that might be affected
      if (severity === "high") {
        if (disasterType === "flood" && region.includes("River")) {
          // Simulate downstream areas for river floods
          affectedAreas.push(`${region} Delta`, `Lower ${region}`);
        } else if (disasterType === "wildfire") {
          // Simulate spreading direction for wildfires
          affectedAreas.push(`Northern ${region}`, `Eastern ${region}`);
        } else if (disasterType === "earthquake") {
          // Simulate radius for earthquakes
          affectedAreas.push(`${region} Coastal Areas`, `${region} Urban Centers`);
        }
      }
      
      const prediction = await storage.createDisasterPrediction({
        disasterType,
        region,
        riskLevel,
        severity,
        description,
        predictedTimeframe,
        affectedAreas,
        sourceData: sourceData || { simulatedData: true, timestamp: new Date().toISOString() }
      });
      
      // Create an alert if high risk or if confidence exceeds threshold
      const shouldCreateAlert = severity === "high" || 
                               (confidenceThreshold && confidence >= confidenceThreshold);
      
      if (shouldCreateAlert) {
        // Create more detailed alerts for 2025
        const alertTitle = `${disasterType.charAt(0).toUpperCase() + disasterType.slice(1)} ${severity === "high" ? "Warning" : "Advisory"}`;
        
        // More actionable message with location precision
        const alertMessage = severity === "high"
          ? `URGENT: ${Math.round(riskLevel * 100)}% risk in ${predictedTimeframe} for ${region}. Prepare for immediate action.`
          : `${Math.round(riskLevel * 100)}% ${disasterType} risk detected in ${region}. Expected in ${predictedTimeframe}. Stay alert.`;
        
        const alert = await storage.createAlert({
          predictionId: prediction.id,
          title: alertTitle,
          message: alertMessage,
          severity: severity === "high" ? "critical" : "warning",
          region,
          isActive: true
        });
        
        // Broadcast new alert
        broadcastMessage({
          type: 'new_alert',
          payload: alert
        });
      }
      
      // Broadcast new prediction
      broadcastMessage({
        type: 'new_prediction',
        payload: prediction
      });
      
      res.status(201).json(prediction);
    } catch (error) {
      console.error('Error in prediction simulation:', error);
      res.status(500).json({ message: "Failed to create simulated prediction" });
    }
  });

  return httpServer;
}
