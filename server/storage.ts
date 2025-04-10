import { users, type User, type InsertUser, events, type Event, type InsertEvent, studies, type Study, type InsertStudy, posts, type Post, type InsertPost, forumTopics, type ForumTopic, type InsertForumTopic, forumReplies, type ForumReply, type InsertForumReply, siteSettings, type SiteSetting, type InsertSiteSetting } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Event operations
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  getAllEvents(): Promise<Event[]>;
  getUpcomingEvents(count?: number): Promise<Event[]>;
  
  // Study operations
  getStudy(id: number): Promise<Study | undefined>;
  createStudy(study: InsertStudy): Promise<Study>;
  updateStudy(id: number, study: Partial<InsertStudy>): Promise<Study | undefined>;
  deleteStudy(id: number): Promise<boolean>;
  getAllStudies(): Promise<Study[]>;
  
  // Post operations
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  getAllPosts(): Promise<Post[]>;
  
  // Forum operations
  getForumTopic(id: number): Promise<ForumTopic | undefined>;
  createForumTopic(topic: InsertForumTopic): Promise<ForumTopic>;
  updateForumTopic(id: number, topic: Partial<InsertForumTopic>): Promise<ForumTopic | undefined>;
  deleteForumTopic(id: number): Promise<boolean>;
  getAllForumTopics(): Promise<ForumTopic[]>;
  
  getForumReply(id: number): Promise<ForumReply | undefined>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  updateForumReply(id: number, reply: Partial<InsertForumReply>): Promise<ForumReply | undefined>;
  deleteForumReply(id: number): Promise<boolean>;
  getForumRepliesByTopic(topicId: number): Promise<ForumReply[]>;
  
  // Site settings operations
  getSiteSetting(key: string): Promise<SiteSetting | undefined>;
  createSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting>;
  updateSiteSetting(id: number, setting: Partial<InsertSiteSetting>): Promise<SiteSetting | undefined>;
  getAllSiteSettings(): Promise<SiteSetting[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private eventsData: Map<number, Event>;
  private studiesData: Map<number, Study>;
  private postsData: Map<number, Post>;
  private forumTopicsData: Map<number, ForumTopic>;
  private forumRepliesData: Map<number, ForumReply>;
  private siteSettingsData: Map<number, SiteSetting>;
  
  private userIdCounter: number;
  private eventIdCounter: number;
  private studyIdCounter: number;
  private postIdCounter: number;
  private forumTopicIdCounter: number;
  private forumReplyIdCounter: number;
  private siteSettingIdCounter: number;
  
  public sessionStore: session.SessionStore;

  constructor() {
    this.usersData = new Map();
    this.eventsData = new Map();
    this.studiesData = new Map();
    this.postsData = new Map();
    this.forumTopicsData = new Map();
    this.forumRepliesData = new Map();
    this.siteSettingsData = new Map();
    
    this.userIdCounter = 1;
    this.eventIdCounter = 1;
    this.studyIdCounter = 1;
    this.postIdCounter = 1;
    this.forumTopicIdCounter = 1;
    this.forumReplyIdCounter = 1;
    this.siteSettingIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.usersData.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.usersData.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.usersData.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersData.values());
  }

  // Event methods
  async getEvent(id: number): Promise<Event | undefined> {
    return this.eventsData.get(id);
  }

  async createEvent(eventData: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const now = new Date();
    const event: Event = { ...eventData, id, createdAt: now };
    this.eventsData.set(id, event);
    return event;
  }
  
  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const existingEvent = this.eventsData.get(id);
    if (!existingEvent) return undefined;
    
    const updatedEvent = { ...existingEvent, ...eventData };
    this.eventsData.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.eventsData.delete(id);
  }
  
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.eventsData.values());
  }
  
  async getUpcomingEvents(count: number = 5): Promise<Event[]> {
    const now = new Date();
    return Array.from(this.eventsData.values())
      .filter(event => new Date(event.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, count);
  }

  // Study methods
  async getStudy(id: number): Promise<Study | undefined> {
    return this.studiesData.get(id);
  }

  async createStudy(studyData: InsertStudy): Promise<Study> {
    const id = this.studyIdCounter++;
    const now = new Date();
    const study: Study = { ...studyData, id, createdAt: now };
    this.studiesData.set(id, study);
    return study;
  }
  
  async updateStudy(id: number, studyData: Partial<InsertStudy>): Promise<Study | undefined> {
    const existingStudy = this.studiesData.get(id);
    if (!existingStudy) return undefined;
    
    const updatedStudy = { ...existingStudy, ...studyData };
    this.studiesData.set(id, updatedStudy);
    return updatedStudy;
  }
  
  async deleteStudy(id: number): Promise<boolean> {
    return this.studiesData.delete(id);
  }
  
  async getAllStudies(): Promise<Study[]> {
    return Array.from(this.studiesData.values());
  }

  // Post methods
  async getPost(id: number): Promise<Post | undefined> {
    return this.postsData.get(id);
  }

  async createPost(postData: InsertPost): Promise<Post> {
    const id = this.postIdCounter++;
    const now = new Date();
    const post: Post = { ...postData, id, createdAt: now };
    this.postsData.set(id, post);
    return post;
  }
  
  async updatePost(id: number, postData: Partial<InsertPost>): Promise<Post | undefined> {
    const existingPost = this.postsData.get(id);
    if (!existingPost) return undefined;
    
    const updatedPost = { ...existingPost, ...postData };
    this.postsData.set(id, updatedPost);
    return updatedPost;
  }
  
  async deletePost(id: number): Promise<boolean> {
    return this.postsData.delete(id);
  }
  
  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.postsData.values());
  }

  // Forum methods
  async getForumTopic(id: number): Promise<ForumTopic | undefined> {
    return this.forumTopicsData.get(id);
  }

  async createForumTopic(topicData: InsertForumTopic): Promise<ForumTopic> {
    const id = this.forumTopicIdCounter++;
    const now = new Date();
    const topic: ForumTopic = { ...topicData, id, createdAt: now };
    this.forumTopicsData.set(id, topic);
    return topic;
  }
  
  async updateForumTopic(id: number, topicData: Partial<InsertForumTopic>): Promise<ForumTopic | undefined> {
    const existingTopic = this.forumTopicsData.get(id);
    if (!existingTopic) return undefined;
    
    const updatedTopic = { ...existingTopic, ...topicData };
    this.forumTopicsData.set(id, updatedTopic);
    return updatedTopic;
  }
  
  async deleteForumTopic(id: number): Promise<boolean> {
    return this.forumTopicsData.delete(id);
  }
  
  async getAllForumTopics(): Promise<ForumTopic[]> {
    return Array.from(this.forumTopicsData.values());
  }
  
  async getForumReply(id: number): Promise<ForumReply | undefined> {
    return this.forumRepliesData.get(id);
  }

  async createForumReply(replyData: InsertForumReply): Promise<ForumReply> {
    const id = this.forumReplyIdCounter++;
    const now = new Date();
    const reply: ForumReply = { ...replyData, id, createdAt: now };
    this.forumRepliesData.set(id, reply);
    return reply;
  }
  
  async updateForumReply(id: number, replyData: Partial<InsertForumReply>): Promise<ForumReply | undefined> {
    const existingReply = this.forumRepliesData.get(id);
    if (!existingReply) return undefined;
    
    const updatedReply = { ...existingReply, ...replyData };
    this.forumRepliesData.set(id, updatedReply);
    return updatedReply;
  }
  
  async deleteForumReply(id: number): Promise<boolean> {
    return this.forumRepliesData.delete(id);
  }
  
  async getForumRepliesByTopic(topicId: number): Promise<ForumReply[]> {
    return Array.from(this.forumRepliesData.values())
      .filter(reply => reply.topicId === topicId);
  }

  // Site settings methods
  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    return Array.from(this.siteSettingsData.values()).find(setting => setting.key === key);
  }

  async createSiteSetting(settingData: InsertSiteSetting): Promise<SiteSetting> {
    const id = this.siteSettingIdCounter++;
    const now = new Date();
    const setting: SiteSetting = { ...settingData, id, updatedAt: now };
    this.siteSettingsData.set(id, setting);
    return setting;
  }
  
  async updateSiteSetting(id: number, settingData: Partial<InsertSiteSetting>): Promise<SiteSetting | undefined> {
    const existingSetting = this.siteSettingsData.get(id);
    if (!existingSetting) return undefined;
    
    const now = new Date();
    const updatedSetting = { ...existingSetting, ...settingData, updatedAt: now };
    this.siteSettingsData.set(id, updatedSetting);
    return updatedSetting;
  }
  
  async getAllSiteSettings(): Promise<SiteSetting[]> {
    return Array.from(this.siteSettingsData.values());
  }
}

export const storage = new MemStorage();
