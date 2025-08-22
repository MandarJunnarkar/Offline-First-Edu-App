import { createClient } from "@supabase/supabase-js";

// Your Supabase configuration - Load from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Content service using Supabase
export const contentService = {
  // Get all content from cloud
  async getAllContent() {
    try {
      const { data, error } = await supabase
        .from("educational_content")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching content:", error);
      throw error;
    }
  },

  // Add new content to cloud
  async addContent(contentData) {
    try {
      const { data, error } = await supabase
        .from("educational_content")
        .insert([
          {
            title: contentData.title,
            description: contentData.description,
            type: contentData.type,
            subject: contentData.subject,
            grade: contentData.grade,
            size: contentData.size,
            url: contentData.url,
            thumbnail: contentData.thumbnail,
            tags: contentData.tags,
          },
        ])
        .select();

      if (error) throw error;
      return data[0].id;
    } catch (error) {
      console.error("Error adding content:", error);
      throw error;
    }
  },

  // Update existing content
  async updateContent(id, updates) {
    try {
      const { error } = await supabase
        .from("educational_content")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating content:", error);
      throw error;
    }
  },

  // Delete content
  async deleteContent(id) {
    try {
      const { error } = await supabase
        .from("educational_content")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting content:", error);
      throw error;
    }
  },
};

export default supabase;
