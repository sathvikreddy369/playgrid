const MALE_NAMES = [
  'Sathvik', 'Rahul', 'Rohit', 'Sai', 'Krishna', 'Arjun', 'Ram', 'Shiva', 'Varun', 'Aditya', 
  'Karthik', 'Sandeep', 'Ravi', 'Kiran', 'Prasad', 'Suresh', 'Ramesh', 'Harish', 'Naveen', 
  'Praveen', 'Venkatesh', 'Kalyan', 'Srinivas', 'Anil', 'Sunil', 'Vijay', 'Ajay', 'Vamshi',
  'Pavan', 'Tharun', 'Gopi', 'Bhaskar', 'Manish', 'Nithin', 'Abhishek', 'Akhil', 'Prashanth'
];

const FEMALE_NAMES = [
  'Priya', 'Anjali', 'Sneha', 'Divya', 'Swathi', 'Lakshmi', 'Bhavana', 'Pooja', 'Keerthi', 
  'Niharika', 'Sindhu', 'Kavya', 'Deepthi', 'Sruthi', 'Alekhya', 'Pranathi', 'Sushma', 
  'Harika', 'Mounika', 'Sowmya', 'Sravani', 'Geetha', 'Radhika', 'Ramya', 'Anusha', 'Pallavi'
];

const LAST_NAMES = [
  'Reddy', 'Rao', 'Kumar', 'Varma', 'Naidu', 'Chowdary', 'Raju', 'Goud', 'Yadav', 'Gowda',
  'Iyer', 'Sharma', 'Singh', 'Patel', 'Das', 'Sen', 'Nair', 'Babu', 'Chary', 'Gupta',
  'Murthy', 'Konduru', 'Yadagiri', 'Mudaliar', 'Pillai', 'Menon'
];

export const getRandomName = () => {
  const isMale = Math.random() > 0.3; // 70% male bias for sports app realism, though women play too
  const firstName = isMale 
    ? MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)]
    : FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  
  return `${firstName} ${lastName}`;
};

export const getRandomAvatar = (name: string) => {
  // Use UI avatars with nice colors
  const colors = ['1E3A8A', '047857', 'B91C1C', '4338CA', '0F766E', 'A21CAF', 'BE185D', 'D97706'];
  const bg = colors[Math.floor(Math.random() * colors.length)];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&size=150`;
};
