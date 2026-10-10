"""Hold an action until the same decision repeats.

A single noisy frame should not flip STOP / CAUTION / KEEP MOVING.
The smoother publishes the previous action until the new one has been
seen for `hold_frames` consecutive frames.
"""


class ActionSmoother:
    def __init__(self, hold_frames=3):
        if hold_frames < 1:
            raise ValueError("hold_frames must be at least 1")
        self.hold_frames = hold_frames
        self.committed = (0, "KEEP MOVING")
        self._pending = None
        self._pending_count = 0

    def update(self, rank, label):
        proposal = (rank, label)
        if proposal == self.committed:
            self._pending = None
            self._pending_count = 0
            return self.committed

        if proposal == self._pending:
            self._pending_count += 1
        else:
            self._pending = proposal
            self._pending_count = 1

        if self._pending_count >= self.hold_frames:
            self.committed = proposal
            self._pending = None
            self._pending_count = 0

        return self.committed
