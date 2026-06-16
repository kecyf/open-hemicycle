import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton() {
  return (
    <Link href="/api/auth/signout?callbackUrl=/" className={cn(buttonVariants({ variant: "outline" }))}>
      Déconnexion
    </Link>
  );
}
