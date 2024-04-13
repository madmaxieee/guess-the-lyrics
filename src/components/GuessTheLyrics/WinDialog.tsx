import ConfettiExplosion from "react-confetti-explosion";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type WinDialogProps = {
  showWinDialog: boolean;
  setShowWinDialog: (show: boolean) => void;
  artist: string;
};

export default function WinDialog({
  showWinDialog,
  setShowWinDialog,
  artist,
}: WinDialogProps) {
  return (
    <>
      <Dialog open={showWinDialog} onOpenChange={setShowWinDialog}>
        <DialogContent>
          <DialogTitle className="text-3xl">You win!</DialogTitle>
          <DialogDescription className="text-xl">
            {`Now you can brag about your score to your friends! You are a true ${artist} fan!`}
            <div className="mx-auto w-0">
              {showWinDialog && (
                <ConfettiExplosion zIndex={1000} duration={3000} />
              )}
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}
