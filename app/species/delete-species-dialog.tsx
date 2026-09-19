"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Species = Database["public"]["Tables"]["species"]["Row"];

export default function DeleteSpeciesDialog({
  species,
}: {
  species: Species;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const deleteSpecies = async () => {
    const supabase = createBrowserSupabaseClient();

    const { error } = await supabase
      .from("species")
      .delete()
      .eq("id", species.id);

    if (error) {
      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }

    setOpen(false);

    router.refresh();

    return toast({
      title: "Species deleted!",
      description: `${species.scientific_name} was successfully deleted.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-2 w-full" variant="destructive">
          Delete Species
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Species?</DialogTitle>

          <DialogDescription>
            Are you sure you want to delete {species.scientific_name}?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => void deleteSpecies()}
          >
            Delete
          </Button>

          <DialogClose asChild>
            <Button variant="secondary" className="flex-1">
              Cancel
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}