import { Separator } from "@/components/ui/separator";
import { TypographyH2 } from "@/components/ui/typography";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import AddSpeciesDialog from "./add-species-dialog";
import SpeciesCard from "./species-card";

export default async function SpeciesList() {
  // Create supabase server component client and obtain user session from stored cookie
  const supabase = createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // This is a protected route - only users who are signed in can view this route
    redirect("/");
  }

  // Obtain the ID of the currently signed-in user
  const sessionId = session.user.id;

  // Get species AND the profile of the user who created each species
  const { data: species, error } = await supabase
    .from("species")
    .select(`
      *,
      author_profile:profiles(*)
    `)
    .order("id", { ascending: false });

  if (error) {
    console.error("Error fetching species:", error);
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <TypographyH2>Species List</TypographyH2>

        <AddSpeciesDialog userId={sessionId} />
      </div>

      <Separator className="my-4" />

      <div className="flex flex-wrap justify-center">
        {species?.map((species) => (
          <SpeciesCard
            key={species.id}
            species={species}
            sessionId={sessionId}
          />
        ))}
      </div>
    </>
  );
}