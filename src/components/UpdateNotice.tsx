import { UpdateControls } from './UpdateControls';

/** Updates are an offer, never a surprise install or restart. */
export function UpdateNotice() {
  return <UpdateControls compact />;
}
