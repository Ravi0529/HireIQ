import { Card } from "@/components/ui/card";
import { Bot, Mic } from "lucide-react";

export default function AIFeed() {
  return (
    <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 rounded-xl">
      <div className="flex items-start gap-3">
        <div className="bg-purple-100 p-2 rounded-full flex-shrink-0">
          <Bot className="h-5 w-5 text-purple-600" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-purple-800">
              AI Interviewer
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              Speaking
            </span>
          </div>

          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-purple-100">
            <div className="flex gap-1">
              <span
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              />
              <span
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
              <span
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
            <div className="text-sm text-purple-700 font-medium">
              Preparing your next question...
            </div>
          </div>

          <div className="mt-3 text-xs text-purple-500 flex items-center gap-1">
            <Mic className="h-3 w-3" />
            <span>Voice recognition active</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
