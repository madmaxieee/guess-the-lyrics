import Confetti from "../Confetti";

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
          </DialogDescription>
        </DialogContent>
      </Dialog>
      {showWinDialog && <Confetti />}
    </>
  );
}
