import { redirect } from "next/navigation";

export default function CategoriesRedirectPage() {
    // Règle la priorité 1 de l'audit :
    // Intercepte le trafic invité et les liens morts du Footer pour les rediriger vers la recherche
    redirect("/search");
}