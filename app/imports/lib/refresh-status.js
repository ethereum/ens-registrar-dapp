/**
Refreshes the status of the currently searched name
*/
export default function refreshStatus() {
  const name = Session.get('searched');
  Session.set('searched', '');
  Session.set('searched', name);
}