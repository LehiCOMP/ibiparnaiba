import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertEventSchema, insertStudySchema, insertPostSchema, insertForumTopicSchema, insertForumReplySchema, insertSiteSettingSchema } from "@shared/schema";

// Middleware to check if the user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if the user has admin role
const isAdmin = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Events Routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ message: "Error fetching events" });
    }
  });

  app.get("/api/events/upcoming", async (req, res) => {
    try {
      const count = req.query.count ? parseInt(req.query.count as string) : undefined;
      const events = await storage.getUpcomingEvents(count);
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ message: "Error fetching upcoming events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(parseInt(req.params.id));
      if (event) {
        res.status(200).json(event);
      } else {
        res.status(404).json({ message: "Event not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error fetching event" });
    }
  });

  app.post("/api/events", isAuthenticated, async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const newEvent = await storage.createEvent(eventData);
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid event data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating event" });
      }
    }
  });

  app.patch("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const existingEvent = await storage.getEvent(eventId);
      
      if (!existingEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Only the creator or admin can update
      if (existingEvent.createdBy !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedEvent = await storage.updateEvent(eventId, req.body);
      res.status(200).json(updatedEvent);
    } catch (error) {
      res.status(500).json({ message: "Error updating event" });
    }
  });

  app.delete("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const existingEvent = await storage.getEvent(eventId);
      
      if (!existingEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Only the creator or admin can delete
      if (existingEvent.createdBy !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const result = await storage.deleteEvent(eventId);
      if (result) {
        res.status(200).json({ message: "Event deleted" });
      } else {
        res.status(404).json({ message: "Event not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting event" });
    }
  });

  // Studies Routes
  app.get("/api/studies", async (req, res) => {
    try {
      const studies = await storage.getAllStudies();
      res.status(200).json(studies);
    } catch (error) {
      res.status(500).json({ message: "Error fetching studies" });
    }
  });

  app.get("/api/studies/:id", async (req, res) => {
    try {
      const study = await storage.getStudy(parseInt(req.params.id));
      if (study) {
        res.status(200).json(study);
      } else {
        res.status(404).json({ message: "Study not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error fetching study" });
    }
  });

  app.post("/api/studies", isAuthenticated, async (req, res) => {
    try {
      const studyData = insertStudySchema.parse(req.body);
      const newStudy = await storage.createStudy(studyData);
      res.status(201).json(newStudy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid study data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating study" });
      }
    }
  });

  app.patch("/api/studies/:id", isAuthenticated, async (req, res) => {
    try {
      const studyId = parseInt(req.params.id);
      const existingStudy = await storage.getStudy(studyId);
      
      if (!existingStudy) {
        return res.status(404).json({ message: "Study not found" });
      }
      
      // Only the author or admin can update
      if (existingStudy.authorId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedStudy = await storage.updateStudy(studyId, req.body);
      res.status(200).json(updatedStudy);
    } catch (error) {
      res.status(500).json({ message: "Error updating study" });
    }
  });

  app.delete("/api/studies/:id", isAuthenticated, async (req, res) => {
    try {
      const studyId = parseInt(req.params.id);
      const existingStudy = await storage.getStudy(studyId);
      
      if (!existingStudy) {
        return res.status(404).json({ message: "Study not found" });
      }
      
      // Only the author or admin can delete
      if (existingStudy.authorId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const result = await storage.deleteStudy(studyId);
      if (result) {
        res.status(200).json({ message: "Study deleted" });
      } else {
        res.status(404).json({ message: "Study not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting study" });
    }
  });

  // Posts Routes
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPost(parseInt(req.params.id));
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({ message: "Post not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error fetching post" });
    }
  });

  app.post("/api/posts", isAuthenticated, async (req, res) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      const newPost = await storage.createPost(postData);
      res.status(201).json(newPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid post data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating post" });
      }
    }
  });

  app.patch("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const existingPost = await storage.getPost(postId);
      
      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Only the author or admin can update
      if (existingPost.authorId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedPost = await storage.updatePost(postId, req.body);
      res.status(200).json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "Error updating post" });
    }
  });

  app.delete("/api/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const existingPost = await storage.getPost(postId);
      
      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Only the author or admin can delete
      if (existingPost.authorId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const result = await storage.deletePost(postId);
      if (result) {
        res.status(200).json({ message: "Post deleted" });
      } else {
        res.status(404).json({ message: "Post not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting post" });
    }
  });

  // Forum Routes
  app.get("/api/forum/topics", async (req, res) => {
    try {
      const topics = await storage.getAllForumTopics();
      res.status(200).json(topics);
    } catch (error) {
      res.status(500).json({ message: "Error fetching forum topics" });
    }
  });

  app.get("/api/forum/topics/:id", async (req, res) => {
    try {
      const topic = await storage.getForumTopic(parseInt(req.params.id));
      if (topic) {
        res.status(200).json(topic);
      } else {
        res.status(404).json({ message: "Forum topic not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error fetching forum topic" });
    }
  });

  app.post("/api/forum/topics", isAuthenticated, async (req, res) => {
    try {
      const topicData = insertForumTopicSchema.parse(req.body);
      const newTopic = await storage.createForumTopic(topicData);
      res.status(201).json(newTopic);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid forum topic data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating forum topic" });
      }
    }
  });

  app.patch("/api/forum/topics/:id", isAuthenticated, async (req, res) => {
    try {
      const topicId = parseInt(req.params.id);
      const existingTopic = await storage.getForumTopic(topicId);
      
      if (!existingTopic) {
        return res.status(404).json({ message: "Forum topic not found" });
      }
      
      // Only the author or admin can update
      if (existingTopic.authorId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedTopic = await storage.updateForumTopic(topicId, req.body);
      res.status(200).json(updatedTopic);
    } catch (error) {
      res.status(500).json({ message: "Error updating forum topic" });
    }
  });

  app.delete("/api/forum/topics/:id", isAuthenticated, async (req, res) => {
    try {
      const topicId = parseInt(req.params.id);
      const existingTopic = await storage.getForumTopic(topicId);
      
      if (!existingTopic) {
        return res.status(404).json({ message: "Forum topic not found" });
      }
      
      // Only the author or admin can delete
      if (existingTopic.authorId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const result = await storage.deleteForumTopic(topicId);
      if (result) {
        res.status(200).json({ message: "Forum topic deleted" });
      } else {
        res.status(404).json({ message: "Forum topic not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting forum topic" });
    }
  });

  app.get("/api/forum/topics/:topicId/replies", async (req, res) => {
    try {
      const topicId = parseInt(req.params.topicId);
      const replies = await storage.getForumRepliesByTopic(topicId);
      res.status(200).json(replies);
    } catch (error) {
      res.status(500).json({ message: "Error fetching forum replies" });
    }
  });

  app.post("/api/forum/replies", isAuthenticated, async (req, res) => {
    try {
      const replyData = insertForumReplySchema.parse(req.body);
      const newReply = await storage.createForumReply(replyData);
      res.status(201).json(newReply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid forum reply data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating forum reply" });
      }
    }
  });

  app.patch("/api/forum/replies/:id", isAuthenticated, async (req, res) => {
    try {
      const replyId = parseInt(req.params.id);
      const existingReply = await storage.getForumReply(replyId);
      
      if (!existingReply) {
        return res.status(404).json({ message: "Forum reply not found" });
      }
      
      // Only the author or admin can update
      if (existingReply.authorId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedReply = await storage.updateForumReply(replyId, req.body);
      res.status(200).json(updatedReply);
    } catch (error) {
      res.status(500).json({ message: "Error updating forum reply" });
    }
  });

  app.delete("/api/forum/replies/:id", isAuthenticated, async (req, res) => {
    try {
      const replyId = parseInt(req.params.id);
      const existingReply = await storage.getForumReply(replyId);
      
      if (!existingReply) {
        return res.status(404).json({ message: "Forum reply not found" });
      }
      
      // Only the author or admin can delete
      if (existingReply.authorId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const result = await storage.deleteForumReply(replyId);
      if (result) {
        res.status(200).json({ message: "Forum reply deleted" });
      } else {
        res.status(404).json({ message: "Forum reply not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting forum reply" });
    }
  });

  // User Routes (admin only)
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Don't send passwords in response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.status(200).json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.patch("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      // Never allow password updates through this endpoint
      const { password, ...updateData } = req.body;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      if (updatedUser) {
        // Don't send password in response
        const { password, ...userWithoutPassword } = updatedUser;
        res.status(200).json(userWithoutPassword);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error updating user" });
    }
  });

  // Site Settings Routes
  app.get("/api/site-settings", async (req, res) => {
    try {
      const settings = await storage.getAllSiteSettings();
      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching site settings" });
    }
  });

  app.get("/api/site-settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSiteSetting(req.params.key);
      if (setting) {
        res.status(200).json(setting);
      } else {
        res.status(404).json({ message: "Setting not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error fetching site setting" });
    }
  });

  app.post("/api/site-settings", isAdmin, async (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key) {
        return res.status(400).json({ message: "Key is required" });
      }
      
      // Check if setting exists
      const existingSetting = await storage.getSiteSetting(key);
      
      if (existingSetting) {
        // Update
        const updated = await storage.updateSiteSetting(existingSetting.id, { 
          key, 
          value,
          updatedBy: req.user!.id 
        });
        res.status(200).json(updated);
      } else {
        // Create
        const newSetting = await storage.createSiteSetting({ 
          key, 
          value, 
          updatedBy: req.user!.id 
        });
        res.status(201).json(newSetting);
      }
    } catch (error) {
      res.status(500).json({ message: "Error updating site setting" });
    }
  });

  // Batch update site settings (admin only)
  app.post("/api/site-settings/batch", isAdmin, async (req, res) => {
    try {
      if (!Array.isArray(req.body)) {
        return res.status(400).json({ message: "Request body must be an array" });
      }
      
      const results = [];
      
      for (const item of req.body) {
        const { key, value } = item;
        if (!key) continue;
        
        // Check if setting exists
        const existingSetting = await storage.getSiteSetting(key);
        
        if (existingSetting) {
          // Update
          const updated = await storage.updateSiteSetting(existingSetting.id, { 
            key, 
            value,
            updatedBy: req.user!.id 
          });
          results.push(updated);
        } else {
          // Create
          const newSetting = await storage.createSiteSetting({ 
            key, 
            value,
            updatedBy: req.user!.id 
          });
          results.push(newSetting);
        }
      }
      
      res.status(200).json({ message: "Settings updated", count: results.length });
    } catch (error) {
      res.status(500).json({ message: "Error updating site settings" });
    }
  });
  
  // Media upload endpoints
  app.post("/api/upload", isAuthenticated, async (req, res) => {
    try {
      // Na implementação real, aqui você processaria o upload de arquivo,
      // salvaria no servidor ou serviço de armazenamento (como S3) e 
      // retornaria a URL. Para este protótipo, simularemos que foi salvo.
      
      // Simulação: retorna uma URL fake para o arquivo
      // Em produção, use uma biblioteca como multer para processar o upload
      // e gerar URLs reais para os arquivos
      res.status(200).json({ 
        url: `https://exemplo.com/uploads/${Date.now()}.jpg`,
        message: "Arquivo enviado com sucesso" 
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao fazer upload do arquivo" });
    }
  });
  
  // Obter mídias (simplificado para protótipo)
  app.get("/api/media", isAuthenticated, async (req, res) => {
    try {
      // Aqui você buscaria as mídias do usuário no banco de dados
      // Para o protótipo, retornamos algumas URLs de exemplo
      res.status(200).json([
        { id: 1, url: "https://exemplo.com/uploads/1.jpg", title: "Imagem 1", type: "image" },
        { id: 2, url: "https://exemplo.com/uploads/2.jpg", title: "Imagem 2", type: "image" },
        { id: 3, url: "https://exemplo.com/uploads/3.pdf", title: "Documento 1", type: "document" }
      ]);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar mídias" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
