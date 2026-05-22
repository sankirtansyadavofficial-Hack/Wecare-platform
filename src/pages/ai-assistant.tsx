import { AnimatedAIChat } from "@/components/ui/animated-ai-chat"
import { PageHeader } from "@/components/ui/page-header"
import { Sparkles } from "lucide-react"

export function AIAssistant() {
  return (
    <div className="min-h-screen bg-transparent w-full">
      <div className="pt-24 md:pt-32" />
      <AnimatedAIChat />
    </div>
  );
}
