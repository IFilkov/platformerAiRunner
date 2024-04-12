// Инициализация холста
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Переменные для игры (герой, платформы и лестница)
const hero = {
  x: 100,
  y: canvas.height - 150, // Начальная позиция героя
  width: 30,
  height: 30,
  speedX: 0,
  speedY: 0,
  gravity: 0.5,
};

const enemy = {
  x: 50, // начальная координата X врага
  y: 50, // начальная координата Y врага
  width: 30, // ширина врага
  height: 30, // высота врага
  speedX: 4, // скорость движения врага по горизонтали
  speedY: 0,
  maxSpeedY: 2, // Максимальная скорость движения врага по вертикали
  gravity: 0.5, // начальная вертикальная скорость врага
  isOnLadder: false, // Проверка, находится ли враг на лестнице
  ladderDecisionMade: false, // Проверка, принял ли он решение, куда подниматься или спускаться
  visitedEdges: { left: false, right: false },
  // Дополнительные свойства, как необходимо
};

// Установка платформ
const platforms = [];
const platformHeight = 10;
const platformWidth = canvas.width / 2;
for (let i = 0; i < 10; i++) {
  platforms.push({
    x: (i % 2) * (canvas.width - platformWidth), // Чередование платформ слева и справа
    y: canvas.height - i * (platformHeight + 100),
    width: platformWidth,
    height: platformHeight,
  });
}

// Лестница
const ladder = {
  x: canvas.width - platformWidth / 1 - 30,
  y: 0,
  width: 30,
  height: canvas.height,
};

function intersectRect(r1, r2) {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  );
}

// Функции для отрисовки
function drawHero() {
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(hero.x, hero.y, hero.width, hero.height);
}

function drawEnemy() {
  ctx.fillStyle = "#9933ff";
  ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
}

function drawPlatforms() {
  ctx.fillStyle = "#8B4513";
  platforms.forEach((platform) => {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
  });
}

function drawLadder() {
  ctx.fillStyle = "#555555";
  ctx.fillRect(ladder.x, ladder.y, ladder.width, ladder.height);
}

// Обработка нажатий на клавиши
function keyDownHandler(e) {
  switch (e.key) {
    case "ArrowLeft":
      hero.speedX = -3;
      break;
    case "ArrowRight":
      hero.speedX = 3;
      break;
    // Подняться по лестнице
    case "ArrowUp":
      if (hero.x + hero.width > ladder.x && hero.x < ladder.x + ladder.width) {
        hero.speedY = -3;
      }
      break;
    // Спуститься по лестнице
    case "ArrowDown":
      if (hero.x + hero.width > ladder.x && hero.x < ladder.x + ladder.width) {
        hero.speedY = 3;
      }
      break;
  }
}

function keyUpHandler(e) {
  switch (e.key) {
    case "ArrowLeft":
    case "ArrowRight":
      hero.speedX = 0;
      break;
    case "ArrowUp":
    case "ArrowDown":
      // Останавливаем героя, если он на лестнице
      if (hero.x + hero.width > ladder.x && hero.x < ladder.x + ladder.width) {
        hero.speedY = 0;
      }
      break;
  }
}

// Добавление слушателей событий для нажатия и отпускания клавиш
window.addEventListener("keydown", keyDownHandler);
window.addEventListener("keyup", keyUpHandler);

// Отслеживание столкновений
function checkCollisions() {
  // Для героя
  hero.isOnPlatform = false;
  platforms.forEach((platform) => {
    if (
      hero.x < platform.x + platform.width &&
      hero.x + hero.width > platform.x &&
      hero.y + hero.height <= platform.y &&
      hero.y + hero.height + hero.speedY > platform.y
    ) {
      hero.isOnPlatform = true;
      hero.y = platform.y - hero.height; // Позиционируем героя на платформе
      if (!isOnLadder(hero, ladder)) hero.speedY = 0; // Герой стоит на платформе
    }
  });

  // Продолжение для героя — если он не на платформе и не на лестнице
  if (!hero.isOnPlatform && !isOnLadder(hero, ladder)) {
    hero.speedY += hero.gravity;
  }

  // Для врага
  enemy.isOnPlatform = isEnemyOnPlatform(enemy);
  if (!enemy.isOnPlatform) {
    enemy.speedY += enemy.gravity;
  }
}

// Определение, находится ли враг на платформе
function isEnemyOnPlatform(enemy) {
  return platforms.some(
    (platform) =>
      enemy.x < platform.x + platform.width &&
      enemy.x + enemy.width > platform.x &&
      enemy.y + enemy.height <= platform.y &&
      enemy.y + enemy.height + enemy.gravity > platform.y
  );
}
function updateHero() {
  hero.speedY += hero.gravity; // Всегда применяем гравитацию
  hero.isOnLadder = false;
  hero.isOnPlatform = false;

  let potentialY = hero.y + hero.speedY;

  // Проверка столкновений с платформами
  for (let i = 0; i < platforms.length; i++) {
    let plat = platforms[i];
    // Проверка на столкновение с верхней частью платформы
    if (
      intersectRect(
        {
          x: hero.x,
          y: potentialY,
          width: hero.width,
          height: hero.height,
        },
        plat
      )
    ) {
      hero.isOnPlatform = true;
      potentialY = plat.y - hero.height; // Обновляем потенциальное Y для избежания проваливания
      hero.speedY = 0;
      break;
    }
  }

  // Проверка нахождения на лестнице
  if (hero.x < ladder.x + ladder.width && hero.x + hero.width > ladder.x) {
    if (hero.y + hero.height > ladder.y && hero.y < ladder.y + ladder.height) {
      hero.speedY = hero.speedY / 2; // Замедляем падение/подъем на лестнице
      hero.isOnLadder = true;
    }
  }

  // Применяем гравитацию только если герой не на платформе или лестнице
  if (!hero.isOnPlatform && !hero.isOnLadder) {
    hero.y += hero.speedY;
  } else if (hero.isOnPlatform || hero.isOnLadder) {
    hero.y = potentialY; // Позиция на платформе или лестнице
  }

  hero.x += hero.speedX;

  // Ограничение движения внутри холста по горизонтали
  if (hero.x < 0) {
    hero.x = 0;
  } else if (hero.x + hero.width > canvas.width) {
    hero.x = canvas.width - hero.width;
  }

  // Ограничение движения внутри холста по вертикали
  if (hero.y < 0) {
    hero.y = 0;
  } else if (hero.y + hero.height > canvas.height) {
    hero.y = canvas.height - hero.height;
    hero.isOnPlatform = true; // Герой стоит на нижней площадке
    hero.speedY = 0;
  }
}

// ...

function updateEnemy() {
  // Если враг не на платформе, применяем гравитацию
  if (!enemy.isOnPlatform) {
    enemy.y += enemy.gravity;
  }

  // Если враг находится на земле или платформе, и не на лестнице, перемещается вправо или влево
  if (
    (enemy.isOnPlatform || enemy.y + enemy.height >= canvas.height) &&
    !enemy.isOnLadder
  ) {
    enemy.speedY = 0; // Отменяем вертикальную скорость
    enemy.y = enemy.isOnPlatform
      ? platforms[getNearestPlatformIndex(enemy)].y - enemy.height
      : canvas.height - enemy.height;
    enemy.x += enemy.speedX;
    // Проверка на пересечение с лестницей
    if (intersectRect(enemy, ladder)) {
      // Враг столкнулся с лестницей и начнет спуск
      enemy.isOnPlatform = false;
      enemy.isOnLadder = true;
      enemy.x = ladder.x; // Чтобы враг не застрял в лестнице, устанавливаем его Х-координату в соответствии с лестницей
    }
  }

  // Проверка достижения края экрана и разворот
  if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
    enemy.speedX = -enemy.speedX; // Разворот в другую сторону
  }

  // Если враг на лестнице, движение вверх или вниз
  if (enemy.isOnLadder) {
    enemy.y += enemy.maxSpeedY;
    let nearestPlatformIndex = getNearestPlatformIndex(enemy);
    // Если враг дошел до платформы, он перестает спускаться и начинает движение по платформе
    if (
      nearestPlatformIndex !== -1 &&
      enemy.y + enemy.height >= platforms[nearestPlatformIndex].y
    ) {
      enemy.isOnLadder = false;
      enemy.isOnPlatform = true;
      enemy.y = platforms[nearestPlatformIndex].y - enemy.height; // то же самое, что и для гравитации
    }
  }

  // Проверка на выход за пределы экрана снизу
  if (enemy.y + enemy.height > canvas.height) {
    enemy.y = canvas.height - enemy.height; // Возвращаем врага на "землю"
  }
}

// Помощник: получить ближайший индекс платформы под врагом
function getNearestPlatformIndex(enemy) {
  let nearestPlatformIndex = -1;
  let closestDistance = Number.MAX_VALUE;
  platforms.forEach((platform, index) => {
    let distanceToPlatform = platform.y - (enemy.y + enemy.height);
    if (distanceToPlatform >= 0 && distanceToPlatform < closestDistance) {
      closestDistance = distanceToPlatform;
      nearestPlatformIndex = index;
    }
  });
  return nearestPlatformIndex;
}

// Остальная часть вашего кода, включая gameLoop() остается без изменений

function getPlatformUnderneath(character) {
  for (let i = platforms.length - 1; i >= 0; i--) {
    const platform = platforms[i];
    if (
      character.x < platform.x + platform.width &&
      character.x + character.width > platform.x &&
      character.y + character.height <= platform.y &&
      character.y + character.height + character.gravity > platform.y
    ) {
      return platform;
    }
  }
  return null;
}

function getPlatformAbove(y) {
  for (let i = platforms.length - 1; i >= 0; i--) {
    if (y < platforms[i].y) {
      return platforms[i];
    }
  }
  return null;
}

function getPlatformBelow(y) {
  for (let i = 0; i < platforms.length; i++) {
    if (y < platforms[i].y) {
      return platforms[i];
    }
  }
  return null;
}

// Часть определения пересечения с платформами в function gameLoop()
function checkCollisionsWithPlatforms() {
  let onPlatform = false;
  platforms.forEach((platform) => {
    if (intersectRect(hero, platform)) {
      hero.y = platform.y - hero.height;
      hero.speedY = 0;
      onPlatform = true;
    }
    if (intersectRect(enemy, platform)) {
      enemy.y = platform.y - enemy.height;
      enemy.speedY = 0;
      onPlatform = true;
    }
  });
  if (!onPlatform) {
    hero.speedY += hero.gravity;
    enemy.speedY += enemy.gravity;
  } else {
    hero.speedY = 0;
    enemy.speedY = 0;
  }
}

// Вспомогательная функция для получения Y координаты нижележащей платформы
function getLowerPlatformY(enemy) {
  for (let i = 1; i < platforms.length; i++) {
    let platform = platforms[i];
    if (
      enemy.y < platform.y &&
      enemy.x + enemy.width > platform.x &&
      enemy.x < platform.x + platform.width
    ) {
      return platform.y; // Y координата нижележащей платформы
    }
  }
  return canvas.height; // Если ниже нет платформ, возвращаем дно канваса
}

// Вспомогательные функции
function isAlignedWithPlatform(enemyY) {
  // Проверяем, выровнен ли враг с платформой
  return platforms.some(
    (platform) =>
      Math.abs(enemyY - (platform.y - enemy.height)) <= Math.abs(enemy.speedY)
  );
}

function getFloorAbove(y) {
  let platformAbove = null;
  platforms.forEach((platform) => {
    if (platform.y < y && (!platformAbove || platformAbove.y < platform.y)) {
      platformAbove = platform;
    }
  });
  return platformAbove;
}

function getFloorBelow(y) {
  let platformBelow = null;
  platforms.forEach((platform) => {
    if (platform.y > y && (!platformBelow || platformBelow.y > platform.y)) {
      platformBelow = platform;
    }
  });
  return platformBelow;
}

// Функция проверки, находится ли враг на лестнице
function isOnLadder(character, ladder) {
  return (
    character.x < ladder.x + ladder.width &&
    character.x + character.width > ladder.x &&
    character.y + character.height > ladder.y &&
    character.y < ladder.y + ladder.height
  );
}

// Функция проверки столкновения врага с платформой
function intersectionWithPlatform(character, platform) {
  return (
    character.x < platform.x + platform.width &&
    character.x + character.width > platform.x &&
    character.y + character.height <= platform.y &&
    character.y + character.height + gravity >= platform.y
  );
}

// Основной игровой цикл
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlatforms();
  drawLadder();
  checkCollisions();
  updateHero();

  updateEnemy();
  drawEnemy();
  hero.x += hero.speedX;

  hero.y += hero.speedY;
  drawHero();

  // Ограничение движения внутри холста
  hero.x = Math.max(0, Math.min(canvas.width - hero.width, hero.x));
  hero.y = Math.max(0, Math.min(canvas.height - hero.height, hero.y));

  requestAnimationFrame(gameLoop);
}

gameLoop();
