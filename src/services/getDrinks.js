const getDrinks = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const drinks = JSON.parse(localStorage.getItem('drinkList')) || [];

      const updatedDrinks = drinks.map(drink => {
        const nonNullPrices = drink.bottles.map(bottle => bottle.price).filter(price => price !== null);
        const averagePrice = nonNullPrices.reduce((acc, price) => acc + price, 0) / nonNullPrices.length;

        let bottleStatus = 'Closed';
        const bottleStatuses = drink.bottles.map(bottle => bottle.status);
        if (bottleStatuses.every(status => status === 'Empty')) {
          bottleStatus = 'Empty';
        } else if (bottleStatuses.every(status => status === 'Sample')) {
          bottleStatus = 'Sample';
        } else if (bottleStatuses.some(status => status === 'Open')) {
          bottleStatus = 'Open';
        }

        return {
          ...drink,
          price: averagePrice,
          bottleStatus: bottleStatus
        };
      });

      resolve(updatedDrinks);
    }, 100);
  });
}

export default getDrinks;
