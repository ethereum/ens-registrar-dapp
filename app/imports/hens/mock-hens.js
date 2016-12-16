//Helper for ENS

export const statuses = {
  noName: 'noName',
  tooShort: 'tooShort',
  available: 'available',
  open: 'open',
  uBidded: 'uBidded',
  uTopBidder: 'uTopBidder',
  uOwnIt: 'uOwnIt'
}

function getStatusByCode(statusCode) {
  throw 'getStatusByCode Not implemented';
}

export function getNameStatus(name) {
  if (!name) {
    return new Promise((resolve) => resolve(statuses.noName));;
  }
  if (name.length < 7) {
    return new Promise((resolve) => resolve(statuses.tooShort));
  }
  var map = {
    '12345-1': statuses.available,
    '12345-2': statuses.open,
    '12345-3': statuses.uBidded,
    '12345-4': statuses.uTopBidder,
    '12345-5': statuses.uOwnIt
  };
  return new Promise((resolve) => resolve(map[name] || statuses.available));
}

export function getTemplateName(status) {
    if (!statuses[status]) {
      throw `${status} is not a valid status`;
    }
    return 'layouts_' + status;
}
