'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Mehboob Alam',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-11-02T17:01:17.194Z',
    '2021-10-28T23:36:17.929Z',
    '2021-11-01T22:19:33.842Z',
  ],
  currency: 'PKR',
  locale: 'en-US', // de-DE
};

const account2 = {
  owner: 'Hasan alam',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'PKR',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const formatMovementDate = function (date, local) {
  const calcDaysPassed = (day1, day2) =>
    Math.round(Math.abs(day2 - day1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return `Today`;
  else if (daysPassed === 1) return `yesterday`;
  else if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const year = date.getFullYear();
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const day = `${date.getDate()}`.padStart(2, 0);
    // return `${day}/${month}/${year}`;
    return Intl.DateTimeFormat(local).format(date);
  }
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const t = acc.movements.indexOf(mov);
    const now = new Date(acc.movementsDates[t]);
    const date = formatMovementDate(now, acc.locale);

    const cur = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
       <div class="movements__date">${date}</div>
        <div class="movements__value">${cur}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0).toFixed(2);
  // const balance = new Intl.NumberFormat(acc.locale, {
  //   style: `currency`,
  //   currency: acc.currency,
  // }).format(acc.balance);
  labelBalance.textContent = `${formatCur(
    acc.balance,
    acc.locale,
    acc.currency
  )}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0)
    .toFixed(2);
  labelSumIn.textContent = `${formatCur(incomes, acc.locale, acc.currency)}`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0)
    .toFixed(2);
  labelSumOut.textContent = `${formatCur(
    Math.abs(out),
    acc.locale,
    acc.currency
  )}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0)
    .toFixed(2);
  labelSumInterest.textContent = `${formatCur(
    interest,
    acc.locale,
    acc.currency
  )}`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startlogOutTimer = function () {
  // Set time to 5 minutes
  let time = 90;
  // Call the timer every second
  const tick = function () {
    let min = `${Math.trunc(time / 60)}`.padStart(2, 0);
    let sec = `${Math.trunc(time % 60)}`.padStart(2, 0);
    // In each call, Print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, Stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  };
  // call
  tick();
  let timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// Fake login
// currentAccount = account1;
// containerApp.style.opacity = 100;
// updateUI(currentAccount);

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Display date and time

    // const now = new Date();
    // const year = now.getFullYear();
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year} , ${hour}:${min}`;

    const now = new Date();
    const options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };

    // const local = navigator.language;
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Logout timer
    if (timer) clearInterval(timer);
    timer = startlogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // reset timer
    clearInterval(timer);
    startlogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);
    // Add transfr date
    currentAccount.movementsDates.push(new Date().toISOString());
    // reset timer
    clearInterval(timer);
    startlogOutTimer();
    // Update UI
    setTimeout(() => updateUI(currentAccount), 3000);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/*
console.log(23 === 23.0);

console.log(0.1 + 0.2);

/// Conversion

console.log(Number('23'));
console.log(+'23');

/// Parsing

console.log(Number.parseInt('30px'));
//It only works when a string starts with a number
console.log(Number.parseInt('e23')); // It will give error

console.log(Number.parseInt('2.5ex'));
console.log(Number.parseFloat('2.5ex'));

// Check if a value is NAN

console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'20ex'));
console.log(Number.isNaN(20 / 0));

// Checking if a value is number

console.log('Checking if a value is number');

console.log(Number.isFinite(20));
console.log(Number.isFinite('20'));
console.log(Number.isFinite(+'20ex'));
console.log(Number.isFinite(20 / 0));

console.log(Number.isInteger(20));
console.log(Number.isInteger(20.0));
console.log(Number.isInteger(20.76));

*/

////////////////////////////////////////// Math

// console.log(Math.sqrt(25));
// console.log(25 ** (1 / 2));
// console.log(8 ** (1 / 3));

// console.log(Math.max(5, 23, 8, 12));
// console.log(Math.max(5, '23', 8, 12));

// console.log(Math.min(5, 23, 8, 12));

// console.log(Math.PI * Number.parseFloat('10px') ** 2);

///   Generating random number

// console.log(Math.trunc(Math.random() * 6) + 1);

// const randomInt = (min, max) =>
//   Math.floor(Math.random() * (max - min) + 1) + min;
///0...1 -> 0...(min,max)->min...max

// console.log(randomInt(10, 20));

/// Rounding integers

// console.log(Math.round(23.3));
// console.log(Math.round(23.9));

// console.log(Math.ceil(23.3));
// console.log(Math.ceil(23.9));

// console.log(Math.floor(23.3));
// console.log(Math.floor(23.9));

// console.log(Math.trunc(-23.3));
// console.log(Math.floor(-23.3));

/// Rounding decimals
/// toFixed() always return string

console.log((2.7).toFixed(0));
console.log((2.7).toFixed(3));
console.log(+(2.536).toFixed(2));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    i % 2 === 0
      ? (row.style.backgroundColor = 'lightblue')
      : (row.style.backgroundColor = 'yellow');
  });
});

////////////////////////////////// Dates

/// Creating Dates

// const now = new Date();
// console.log(now);

// const myBirthday = new Date('jan 11, 2002');
// console.log(myBirthday);

// console.log(new Date(account1.movementsDates[0]));
// console.log(new Date(2037, 10, 19, 12, 45, 13));
// console.log(new Date(0));
// console.log(new Date(3 * 24 * 60 * 60 * 1000));

/// Working with dates

// const future = new Date(2037, 10, 19, 12, 45, 13);
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth());
// console.log(future.getDay());
// console.log(future.getDate());
// console.log(future.getMinutes());
// console.log(future.getSeconds());
// console.log(future.getMilliseconds());
// console.log(future.toISOString());

// console.log(future.getTime());
// console.log(new Date(2142229513000));

// console.log(Date.now());
// console.log(new Date(1635631332204));

// future.setFullYear(2040);
// console.log(future);

///  [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300]

// console.log(typeof new Date().toISOString());

/////////////////////////////////////////////////////// Operations with dates
//// when ever date is converted into a number it produces a time stamp in milliseconds

// const future = new Date(2037, 10, 19, 12, 45, 13);
// console.log(future);
// // converting date into a number
// console.log(+future);

// const calcDaysPassed = (day1, day2) =>
//   Math.abs(day2 - day1) / (1000 * 60 * 60 * 24);

// console.log(calcDaysPassed(new Date(2034, 3, 14), new Date(2034, 3, 4)));

// const num = 3884764.23;

// const options = {
//   style: 'currency',
//   unit: 'celsius',
//   currency: 'EUR',
// };

// console.log(`Punjabi : `, new Intl.NumberFormat('pa', options).format(num));
// console.log(`Urdu    : `, new Intl.NumberFormat('ur', options).format(num));
// console.log(`Urdu PK : `, new Intl.NumberFormat('ur-PK', options).format(num));
// console.log(`syria   : `, new Intl.NumberFormat('ar-SY', options).format(num));

//////////////////////////////////////////////////// Timer

// SetTimeout

const ingredients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(
  x => console.log(`Here is your pizza with ${x.slice().join(` and `)} 🍕`),
  5000,
  ingredients
);

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// setinterval

// setInterval(() => console.log(new Date()), 1000);

console.log(
  `${setInterval(() => new Date().getMinutes(), 60000)}:${setInterval(
    () => new Date().getSeconds(),
    1000
  )}`
);
