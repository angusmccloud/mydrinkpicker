const drinks = [
  {
    name: "Buffalo Trace",
    type: "Bourbon",
    triedBefore: true,
    cost: 40,
    notes: "Smooth and well-balanced"
  },
  {
    name: "Jameson",
    type: "Irish",
    triedBefore: true,
    cost: 30,
    notes: "Light and floral"
  },
  {
    name: "Lagavulin 16",
    type: "Scotch",
    triedBefore: false,
    cost: 110,
    notes: "Rich and peaty"
  },
  {
    name: "Pappy Van Winkle's Family Reserve",
    type: "Bourbon",
    triedBefore: false,
    cost: 1300
  },
  {
    name: "Glenfiddich 12",
    type: "Scotch",
    triedBefore: true,
    cost: 50
  },
  {
    name: "High West Double Rye",
    type: "Rye",
    triedBefore: false,
    cost: 45,
    notes: "Spicy and bold"
  },
  {
    name: "Yamazaki 12",
    type: "Japanese",
    triedBefore: true,
    cost: 150,
    notes: "Fruity and complex"
  },
  {
    name: "Jack Daniel's",
    type: "Tennessee",
    triedBefore: true,
    cost: 25
  },
  {
    name: "Maker's Mark",
    type: "Bourbon",
    triedBefore: true,
    cost: 35,
    notes: "Sweet and easy to drink"
  },
  {
    name: "Ardbeg 10",
    type: "Scotch",
    triedBefore: false,
    cost: 60,
    notes: "Intensely smoky"
  },
  {
    name: "Bulleit Rye",
    type: "Rye",
    triedBefore: false,
    cost: 35
  },
  {
    name: "Laphroaig 10",
    type: "Scotch",
    triedBefore: true,
    cost: 55,
    notes: "Bold and medicinal"
  },
  {
    name: "Eagle Rare 10",
    type: "Bourbon",
    triedBefore: false,
    cost: 50
  },
  {
    name: "Redbreast 12",
    type: "Irish",
    triedBefore: true,
    cost: 65,
    notes: "Rich and full-bodied"
  },
  {
    name: "Balvenie DoubleWood 12",
    type: "Scotch",
    triedBefore: false,
    cost: 70
  },
  {
    name: "Woodford Reserve",
    type: "Bourbon",
    triedBefore: true,
    cost: 45,
    notes: "Complex and full-flavored"
  },
  {
    name: "Sazerac Rye",
    type: "Rye",
    triedBefore: false,
    cost: 40
  },
  {
    name: "Glenmorangie Original",
    type: "Scotch",
    triedBefore: true,
    cost: 40,
    notes: "Smooth and creamy"
  },
  {
    name: "Blanton's Single Barrel",
    type: "Bourbon",
    triedBefore: false,
    cost: 100
  },
  {
    name: "Hakushu 12",
    type: "Japanese",
    triedBefore: true,
    cost: 120,
    notes: "Lightly peated and fresh"
  }
];

const getDrinks = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(drinks);
    }, 100);
  });
}

export default getDrinks;