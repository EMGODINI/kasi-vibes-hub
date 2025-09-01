import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface DailyContentRow {
  id: string;
  is_active: boolean;
  display_date: string; // ISO date
  created_at: string;
  updated_at: string;
  created_by: string;
  image_url?: string | null;
  video_url?: string | null;
  external_url?: string | null;
  content_type: string;
  title: string;
  content?: string | null;
}

const emptyForm: Omit<DailyContentRow, "id" | "created_at" | "updated_at" | "created_by"> = {
  is_active: true,
  display_date: format(new Date(), "yyyy-MM-dd"),
  image_url: "",
  video_url: "",
  external_url: "",
  content_type: "quote",
  title: "",
  content: "",
};

const AdminDailyContentManager = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<DailyContentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("daily_content")
        .select("*")
        .order("display_date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      setItems((data as DailyContentRow[]) || []);
    } catch (error: any) {
      console.error(error);
      toast({ title: "Failed to load", description: error.message, variant: "destructive" as any });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!form.title.trim()) {
      errors.push("Title is required");
    }
    
    if (!form.content_type) {
      errors.push("Content type is required");
    }
    
    if (!form.display_date) {
      errors.push("Display date is required");
    }
    
    // Validate URLs if provided
    if (form.image_url && !isValidUrl(form.image_url)) {
      errors.push("Invalid image URL format");
    }
    
    if (form.video_url && !isValidUrl(form.video_url)) {
      errors.push("Invalid video URL format");
    }
    
    if (form.external_url && !isValidUrl(form.external_url)) {
      errors.push("Invalid external URL format");
    }
    
    // Content type specific validations
    if (form.content_type === 'playlist' && !form.external_url) {
      errors.push("External URL is required for playlist content");
    }
    
    if (form.content_type === 'video' && !form.video_url) {
      errors.push("Video URL is required for video content");
    }
    
    if (form.content_type === 'meme' && !form.image_url) {
      errors.push("Image URL is required for meme content");
    }
    
    return errors;
  };

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(', '),
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSaving(true);
      const payload = {
        ...form,
        title: form.title.trim(),
        content: form.content?.trim() || null,
        // ensure nulls instead of empty strings where appropriate
        image_url: form.image_url?.trim() || null,
        video_url: form.video_url?.trim() || null,
        external_url: form.external_url?.trim() || null,
      } as any;

      if (isEditing && editingId) {
        const { error } = await supabase
          .from("daily_content")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        toast({ title: "Updated", description: "Daily content updated successfully" });
      } else {
        const { error } = await supabase.from("daily_content").insert(payload);
        if (error) throw error;
        toast({ title: "Created", description: "Daily content created successfully" });
      }
      resetForm();
      fetchItems();
    } catch (error: any) {
      console.error(error);
      toast({ title: "Save failed", description: error.message, variant: "destructive" as any });
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (row: DailyContentRow) => {
    setEditingId(row.id);
    setForm({
      is_active: row.is_active,
      display_date: row.display_date?.slice(0, 10),
      image_url: row.image_url || "",
      video_url: row.video_url || "",
      external_url: row.external_url || "",
      content_type: row.content_type,
      title: row.title,
      content: row.content || "",
    });
  };

  const onToggleActive = async (row: DailyContentRow) => {
    try {
      const { error } = await supabase
        .from("daily_content")
        .update({ is_active: !row.is_active })
        .eq("id", row.id);
      if (error) throw error;
      setItems(prev => prev.map(i => (i.id === row.id ? { ...i, is_active: !row.is_active } : i)));
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" as any });
    }
  };

  const onDelete = async (row: DailyContentRow) => {
    if (!confirm("Delete this item?")) return;
    try {
      const { error } = await supabase.from("daily_content").delete().eq("id", row.id);
      if (error) throw error;
      setItems(prev => prev.filter(i => i.id !== row.id));
      toast({ title: "Deleted", description: "Daily content removed" });
    } catch (error: any) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" as any });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Daily Content" : "Create Daily Content"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content_type">Type</Label>
              <Select
                value={form.content_type}
                onValueChange={(v) => setForm({ ...form, content_type: v })}
              >
                <SelectTrigger id="content_type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quote">Quote</SelectItem>
                  <SelectItem value="meme">Meme</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="playlist">Playlist</SelectItem>
                  <SelectItem value="news">News</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={form.content || ""}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Optional text (quote text, description, etc.)"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={form.image_url || ""}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video_url">Video URL</Label>
                <Input
                  id="video_url"
                  value={form.video_url || ""}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="external_url">External URL</Label>
                <Input
                  id="external_url"
                  value={form.external_url || ""}
                  onChange={(e) => setForm({ ...form, external_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="display_date">Display Date</Label>
                <Input
                  id="display_date"
                  type="date"
                  value={form.display_date}
                  onChange={(e) => setForm({ ...form, display_date: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center justify-between mt-6">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {isEditing ? "Update" : "Create"}
              </Button>
              {isEditing && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Scheduled Daily Content</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-muted-foreground">No daily content yet.</div>
          ) : (
            <div className="space-y-3">
              {items.map((row) => (
                <div key={row.id} className="glass-tile rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${row.is_active ? 'text-primary border-primary/40' : 'text-muted-foreground border-border'}`}>
                          {row.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(row.display_date), 'PPP')}
                        </span>
                        <span className="text-xs text-muted-foreground">• {row.content_type}</span>
                      </div>
                      <div className="mt-1 font-medium truncate text-card-foreground">{row.title}</div>
                      {row.content && (
                        <div className="text-sm text-muted-foreground line-clamp-2">{row.content}</div>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                        {row.image_url && <span>🖼️ Image</span>}
                        {row.video_url && <span>🎬 Video</span>}
                        {row.external_url && <span>🔗 Link</span>}
                      </div>
                    </div>

                    <div className="md:self-start flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => onEdit(row)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => onToggleActive(row)}>
                        {row.is_active ? 'Disable' : 'Enable'}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(row)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="text-xs text-muted-foreground">
                Tip: Daily content shows on Roll Up and similar pages. Schedule ahead by setting a future display date.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDailyContentManager;
