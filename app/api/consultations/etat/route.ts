import { relayConsultation } from "@/lib/server/consultations";
export async function GET(request: Request) { return relayConsultation(request, "etat"); }
