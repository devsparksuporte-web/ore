import { redirect } from "next/navigation";

/** Raiz: sem sessão real (mock), envia ao login. */
export default function RootPage() {
  redirect("/login");
}
