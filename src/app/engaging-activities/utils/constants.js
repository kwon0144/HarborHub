// Activity-related constants
export const LOCATIONS = ['CBD', 'Fitzroy', 'St Kilda'];
export const ACTIVITY_TYPES = ['workshop', 'talk', 'socialising', 'just for fun'];

// Generate time options for activity scheduling
export const generateTimeOptions = () => {
  const times = [];
  for (let time = 8 * 60; time <= 22 * 60; time += 30) {
    let hours = Math.floor(time / 60);
    let minutes = time % 60;
    times.push(`${hours}:${minutes === 0 ? '00' : '30'}`);
  }
  return times;
};

// Get minimum selectable date
export const getMinSelectableDate = () => {
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  return minDate;
};
