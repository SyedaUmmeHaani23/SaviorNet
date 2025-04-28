import { 
  users, 
  victims, 
  rescueTeams, 
  shelters, 
  disasterPredictions, 
  alerts,
  type User, 
  type InsertUser,
  type Victim, 
  type InsertVictim,
  type RescueTeam, 
  type InsertRescueTeam,
  type Shelter, 
  type InsertShelter,
  type DisasterPrediction, 
  type InsertDisasterPrediction,
  type Alert, 
  type InsertAlert
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Victim operations
  async getVictims(): Promise<Victim[]> {
    return await db.select().from(victims).orderBy(desc(victims.timestamp));
  }

  async getVictim(id: number): Promise<Victim | undefined> {
    const [victim] = await db.select().from(victims).where(eq(victims.id, id));
    return victim;
  }

  async createVictim(insertVictim: InsertVictim): Promise<Victim> {
    const [victim] = await db
      .insert(victims)
      .values({
        ...insertVictim,
        timestamp: new Date()
      })
      .returning();
    return victim;
  }

  async updateVictimStatus(id: number, status: string, teamId?: number): Promise<Victim | undefined> {
    const [updatedVictim] = await db
      .update(victims)
      .set({ 
        status,
        assignedTeamId: teamId
      })
      .where(eq(victims.id, id))
      .returning();
    return updatedVictim;
  }

  // Rescue Team operations
  async getRescueTeams(): Promise<RescueTeam[]> {
    return await db.select().from(rescueTeams).orderBy(asc(rescueTeams.name));
  }

  async getRescueTeam(id: number): Promise<RescueTeam | undefined> {
    const [team] = await db.select().from(rescueTeams).where(eq(rescueTeams.id, id));
    return team;
  }

  async createRescueTeam(insertTeam: InsertRescueTeam): Promise<RescueTeam> {
    const [team] = await db
      .insert(rescueTeams)
      .values(insertTeam)
      .returning();
    return team;
  }

  async updateRescueTeamStatus(id: number, status: string): Promise<RescueTeam | undefined> {
    const [updatedTeam] = await db
      .update(rescueTeams)
      .set({ status })
      .where(eq(rescueTeams.id, id))
      .returning();
    return updatedTeam;
  }

  async updateRescueTeamLocation(id: number, location: { lat: number, lng: number }): Promise<RescueTeam | undefined> {
    const [updatedTeam] = await db
      .update(rescueTeams)
      .set({ location })
      .where(eq(rescueTeams.id, id))
      .returning();
    return updatedTeam;
  }

  // Shelter operations
  async getShelters(): Promise<Shelter[]> {
    return await db.select().from(shelters).orderBy(asc(shelters.name));
  }

  async getShelter(id: number): Promise<Shelter | undefined> {
    const [shelter] = await db.select().from(shelters).where(eq(shelters.id, id));
    return shelter;
  }

  async createShelter(insertShelter: InsertShelter): Promise<Shelter> {
    const [shelter] = await db
      .insert(shelters)
      .values(insertShelter)
      .returning();
    return shelter;
  }

  async updateShelterOccupancy(id: number, occupancy: number): Promise<Shelter | undefined> {
    const [updatedShelter] = await db
      .update(shelters)
      .set({ currentOccupancy: occupancy })
      .where(eq(shelters.id, id))
      .returning();
    return updatedShelter;
  }

  // Disaster Prediction operations
  async getDisasterPredictions(): Promise<DisasterPrediction[]> {
    return await db.select().from(disasterPredictions).orderBy(desc(disasterPredictions.createdAt));
  }

  async getDisasterPrediction(id: number): Promise<DisasterPrediction | undefined> {
    const [prediction] = await db.select().from(disasterPredictions).where(eq(disasterPredictions.id, id));
    return prediction;
  }

  async createDisasterPrediction(insertPrediction: InsertDisasterPrediction): Promise<DisasterPrediction> {
    const now = new Date();
    const [prediction] = await db
      .insert(disasterPredictions)
      .values({
        ...insertPrediction,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return prediction;
  }

  // Alert operations
  async getAlerts(active?: boolean): Promise<Alert[]> {
    if (active === undefined) {
      return await db.select().from(alerts).orderBy(desc(alerts.createdAt));
    }
    
    return await db
      .select()
      .from(alerts)
      .where(eq(alerts.isActive, active))
      .orderBy(desc(alerts.createdAt));
  }

  async getAlert(id: number): Promise<Alert | undefined> {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, id));
    return alert;
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db
      .insert(alerts)
      .values({
        ...insertAlert,
        createdAt: new Date()
      })
      .returning();
    return alert;
  }

  async deactivateAlert(id: number): Promise<Alert | undefined> {
    const [updatedAlert] = await db
      .update(alerts)
      .set({ isActive: false })
      .where(eq(alerts.id, id))
      .returning();
    return updatedAlert;
  }
}