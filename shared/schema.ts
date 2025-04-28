import { pgTable, text, serial, integer, boolean, timestamp, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("civilian"), // civilian, rescue_team, admin
  phoneNumber: text("phone_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const victims = pgTable("victims", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  status: text("status").notNull(), // pending, assigned, rescued
  sosType: text("sos_type").notNull(), // flood, earthquake, fire, medical, etc.
  location: json("location").notNull(), // { lat: number, lng: number }
  timestamp: timestamp("timestamp").defaultNow(),
  assignedTeamId: integer("assigned_team_id").references(() => rescueTeams.id),
  additionalInfo: text("additional_info"),
});

export const insertVictimSchema = createInsertSchema(victims).omit({
  id: true,
  timestamp: true,
});

export const rescueTeams = pgTable("rescue_teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialization: text("specialization").notNull(), // flood, earthquake, fire, medical, etc.
  status: text("status").notNull(), // available, busy, offline
  location: json("location"), // { lat: number, lng: number }
  capacity: integer("capacity").notNull(),
  contact: text("contact").notNull(),
});

export const insertRescueTeamSchema = createInsertSchema(rescueTeams).omit({
  id: true,
});

export const shelters = pgTable("shelters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: json("location").notNull(), // { lat: number, lng: number }
  capacity: integer("capacity").notNull(),
  currentOccupancy: integer("current_occupancy").notNull().default(0),
  amenities: text("amenities").array(),
  contactInfo: text("contact_info"),
});

export const insertShelterSchema = createInsertSchema(shelters).omit({
  id: true,
});

export const disasterPredictions = pgTable("disaster_predictions", {
  id: serial("id").primaryKey(),
  disasterType: text("disaster_type").notNull(), // flood, earthquake, fire
  region: text("region").notNull(),
  riskLevel: real("risk_level").notNull(), // 0 to 1
  severity: text("severity").notNull(), // low, medium, high
  description: text("description"),
  predictedTimeframe: text("predicted_timeframe"), // immediate, hours, days
  affectedAreas: json("affected_areas"), // array of coordinates or region names
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  sourceData: json("source_data"), // data used for prediction
});

export const insertDisasterPredictionSchema = createInsertSchema(disasterPredictions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  predictionId: integer("prediction_id").references(() => disasterPredictions.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: text("severity").notNull(), // info, warning, critical
  region: text("region").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Victim = typeof victims.$inferSelect;
export type InsertVictim = z.infer<typeof insertVictimSchema>;

export type RescueTeam = typeof rescueTeams.$inferSelect;
export type InsertRescueTeam = z.infer<typeof insertRescueTeamSchema>;

export type Shelter = typeof shelters.$inferSelect;
export type InsertShelter = z.infer<typeof insertShelterSchema>;

export type DisasterPrediction = typeof disasterPredictions.$inferSelect;
export type InsertDisasterPrediction = z.infer<typeof insertDisasterPredictionSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  payload: any;
}

export interface SOSMessage extends WebSocketMessage {
  type: 'sos';
  payload: {
    userId?: number;
    sosType: string;
    location: { lat: number; lng: number };
    additionalInfo?: string;
  };
}

export interface AlertMessage extends WebSocketMessage {
  type: 'alert';
  payload: Alert;
}

export interface TeamAssignmentMessage extends WebSocketMessage {
  type: 'team_assignment';
  payload: {
    victimId: number;
    teamId: number;
  };
}

export interface TeamLocationUpdateMessage extends WebSocketMessage {
  type: 'team_location_update';
  payload: {
    teamId: number;
    location: { lat: number; lng: number };
  };
}

export interface PredictionUpdateMessage extends WebSocketMessage {
  type: 'prediction_update';
  payload: DisasterPrediction;
}
