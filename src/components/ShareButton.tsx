import type { MouseEventHandler } from "react";

import { Share } from "lucide-react";
import { useRouter } from "next/router";

import { useToast } from "@/components/ui/use-toast";
import { env } from "@/env.mjs";
import isMobileUserAgent from "@/utils/isMobileUserAgent";

import { Button } from "./ui/button";

type ShareButtonProps = {
  title: string;
};

export const ShareButton = ({ title }: ShareButtonProps) => {
  const router = useRouter();
  const { toast } = useToast();

  const fullPath = `${env.NEXT_PUBLIC_DOMAIN}${router.asPath}`;
  const handleClick: MouseEventHandler = () => {
    if (navigator.share && isMobileUserAgent(navigator.userAgent)) {
      navigator
        .share({
          title,
          url: fullPath,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(fullPath).catch(console.error);
      toast({
        title: "Link copied to clipboard",
        description: "Challenge your friends to guess the lyrics!",
      });
    }
  };

  return (
    <Button variant="outline" size="icon" onClick={handleClick}>
      <Share className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Share</span>
    </Button>
  );
};
