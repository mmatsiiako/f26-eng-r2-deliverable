"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Database } from "@/lib/schema";
import SpeciesComments from "./species-comments";

type SpeciesRow = Database["public"]["Tables"]["species"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type Species = SpeciesRow & {
  author_profile: Profile | null;
};

export default function SpeciesDetailsDialog({
  species,
  sessionId,
}: {
  species: Species;
  sessionId: string;
}) {
  const profile = species.author_profile as Record<string, unknown> | null;

  // Try to display a useful name from the author's profile.
  // If none exists, fall back to the author's ID.
  const authorName =
    (typeof profile?.full_name === "string" && profile.full_name) ||
    (typeof profile?.username === "string" && profile.username) ||
    (typeof profile?.name === "string" && profile.name) ||
    (typeof profile?.email === "string" && profile.email) ||
    species.author ||
    "Unknown user";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-3 w-full">
          Learn More
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{species.scientific_name}</DialogTitle>

          <DialogDescription>
            Detailed information about this species.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <p>
            <strong>Scientific name:</strong>{" "}
            {species.scientific_name}
          </p>

          <p>
            <strong>Common name:</strong>{" "}
            {species.common_name ?? "Not available"}
          </p>

          <p>
            <strong>Total population:</strong>{" "}
            {species.total_population ?? "Not available"}
          </p>

          <p>
            <strong>Kingdom:</strong>{" "}
            {species.kingdom}
          </p>

          <p>
            <strong>Added by:</strong>{" "}
            {authorName}
          </p>

          <p>
            <strong>Description:</strong>{" "}
            {species.description ?? "No description available."}
          </p>
        </div>

        <SpeciesComments
          speciesId={species.id}
          sessionId={sessionId}
        />
      </DialogContent>
    </Dialog>
  );
}