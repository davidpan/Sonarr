import _ from 'lodash';

function hasDifferentItems(prevItems, currentItems, idProp = 'id') {
  const difference = _.differenceBy(currentItems, prevItems, (item) => item[idProp]);

  return difference.length > 0;
}

export default hasDifferentItems;
