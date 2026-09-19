"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import { useCallback, useEffect, useState } from "react";

type Comment = Database["public"]["Tables"]["comments"]["Row"];

export default function SpeciesComments({
  speciesId,
  sessionId,
}: {
  speciesId: number;
  sessionId: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  // Get all comments for this species
  const loadComments = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("species_id", speciesId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading comments:", error);
      return;
    }

    setComments(data ?? []);
  }, [speciesId]);

  // Load comments when the component first appears
  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  // Add a new comment
  const addComment = async () => {
    const content = newComment.trim();

    if (content === "") {
      return;
    }

    setLoading(true);

    const supabase = createBrowserSupabaseClient();

    const { error } = await supabase.from("comments").insert({
      species_id: speciesId,
      author: sessionId,
      content: content,
    });

    if (error) {
      setLoading(false);

      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }

    setNewComment("");

    await loadComments();

    setLoading(false);

    return toast({
      title: "Comment added!",
      description: "Your comment was posted successfully.",
    });
  };

  // Delete a comment
  const deleteComment = async (commentId: number) => {
    const supabase = createBrowserSupabaseClient();

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }

    await loadComments();

    return toast({
      title: "Comment deleted!",
      description: "Your comment was successfully deleted.",
    });
  };

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="mb-3 text-lg font-semibold">Comments</h3>

      {/* Box for writing a new comment */}
      <div className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(event) => setNewComment(event.target.value)}
          placeholder="Leave a comment..."
        />

        <Button
          type="button"
          onClick={() => void addComment()}
          disabled={loading || newComment.trim() === ""}
        >
          {loading ? "Posting..." : "Post Comment"}
        </Button>
      </div>

      {/* Existing comments */}
      <div className="mt-5 space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to leave one!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="rounded-md border p-3">
              <p>{comment.content}</p>

              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleString()}
              </p>

              {/* Only the author of the comment sees this button */}
              {comment.author === sessionId && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="mt-2"
                  onClick={() => void deleteComment(comment.id)}
                >
                  Delete Comment
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}