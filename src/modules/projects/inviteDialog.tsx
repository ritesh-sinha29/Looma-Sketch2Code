"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LucideCopy,
  LucideInfo,
  LucideMail,
  LucideMessageCircle,
  LucideX,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

type InviteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inviteLink: string;
};

export function InviteDialog({
  open,
  onOpenChange,
  inviteLink,
}: InviteDialogProps) {
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite others to Collab</DialogTitle>
        </DialogHeader>

        {/* Invite link */}
        <div className="flex items-center gap-2">
          <Input value={inviteLink} readOnly />
          <Button variant="outline" size="icon" onClick={copyToClipboard}>
            <LucideCopy className="w-4 h-4" />
          </Button>
        </div>

        <p className="flex gap-2 text-xs text-muted-foreground "><LucideInfo className="w-4 h-4 " /> Inviting to team , means they have full access to your project</p>
        {/* Share options */}
        <div className="flex justify-center gap-6 pt-4">
      
          {/* WhatsApp */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              window.open(
                `https://wa.me/?text=${encodeURIComponent(inviteLink)}`,
                "_blank"
              )
            }
          >
            <Image src="/whatsapp.png" alt="WhatsApp" width={24} height={24} />
          </Button>

          {/* Email */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              window.open(
                `mailto:?subject=Join my project&body=${inviteLink}`,
                "_blank"
              )
            }
          >
            <Image src="/gmail.png" alt="Email" width={24} height={24} />
          </Button>

          {/* Discord */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              window.open(`https://discord.com/channels/@me`, "_blank")
            }
          >
            <Image src="/dis.png" alt="Discord" width={24} height={24} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
