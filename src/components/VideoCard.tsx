import React from "react";
import { parseVideoLink } from "../utils/platformLogic";
import { Video, ExternalLink } from "lucide-react";

interface VideoCardProps {
  episodeLink: string | null;
  episodeNumber?: number;
}

export default function VideoCard({
  episodeLink,
  episodeNumber = 1,
}: VideoCardProps) {
  const parsed = parseVideoLink(episodeLink);

  return (
    <div className="w-full rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
      <div className="aspect-video w-full bg-slate-950 relative">
        {parsed.type === "youtube" ||
        parsed.type === "drive" ||
        parsed.type === "mediadelivery" ? (
          <iframe
            width="100%"
            height="100%"
            src={parsed.embedUrl!}
            title={`مشغل المحاضرة رقم ${episodeNumber}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : parsed.type === "direct" ? (
          <video
            src={parsed.embedUrl!}
            controls
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 text-slate-400">
            <Video className="w-12 h-12 text-[#62ff00]" />
            <p className="text-base font-bold text-white">
              المحاضرة رقم {episodeNumber}
            </p>
            <p className="text-xs text-slate-400 max-w-md">
              الرابط المرفق لهذه المحاضرة غير مهيأ للتشغيل المضمن المباشر أو أنه
              رابط خارجي.
            </p>
            {episodeLink && (
              <a
                href={episodeLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-[#62ff00] rounded-lg hover:bg-[#52d600] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>فتح الرابط في نافذة جديدة</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
