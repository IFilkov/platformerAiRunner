function updateEnemy() {
  // Если враг на лестнице
  if (enemy.isOnLadder) {
    // Враг достигает конца лестницы (верх или низ)
    if (
      (enemy.y <= 0 && enemy.speedY < 0) ||
      (enemy.y + enemy.height >= canvas.height && enemy.speedY > 0)
    ) {
      enemy.isOnLadder = false; // Враг больше не на лестнице
      enemy.ladderDecisionMade = false; // Враг может снова принять решение при столкновении с лестницей
      enemy.speedY = 0; // Останавливаем движение по Y
      // Выбираем направление движения по X, когда враг достигает конца лестницы
      enemy.speedX = enemy.visitedEdges.left ? 4 : -4;
    } else {
      // Продолжаем движение в направлении, выбранном при столкновении с лестницей
      enemy.y += enemy.speedY;
    }
  } else {
    // Движение врага по горизонтали
    enemy.x += enemy.speedX;
    // Проверка на столкновение с краями платформы или экрана
    let onEdge = enemy.x <= 0 || enemy.x + enemy.width >= canvas.width;
    let platformBelow = getPlatformUnderneath(enemy);
    let platformEdge =
      platformBelow &&
      (enemy.x <= platformBelow.x ||
        enemy.x + enemy.width >= platformBelow.x + platformBelow.width);
    if (onEdge || platformEdge) {
      // Враг разворачивается на краю
      enemy.speedX = -enemy.speedX;
      enemy.visitedEdges.left = !enemy.visitedEdges.left;
      enemy.visitedEdges.right = !enemy.visitedEdges.right;
    }
  }

  // Проверка на столкновение с лестницей
  if (intersectRect(enemy, ladder) && !enemy.ladderDecisionMade) {
    enemy.isOnLadder = true;
    enemy.speedX = 0; // Останавливаем движение по X
    // Случайное решение: подняться вверх или спуститься вниз
    enemy.speedY = Math.random() < 0.5 ? -enemy.maxSpeedY : enemy.maxSpeedY;
    enemy.ladderDecisionMade = true;
  }

  // Проверяем, стоит ли враг на платформе
  enemy.isOnPlatform = isEnemyOnPlatform(enemy);
  if (enemy.isOnPlatform && !enemy.isOnLadder) {
    let nearestPlatform = getPlatformUnderneath(enemy);
    if (nearestPlatform) {
      enemy.y = nearestPlatform.y - enemy.height; // Позиционируем врага на платформе
      enemy.speedY = 0; // Останавливаем вертикальное движение
    }
  }

  // Проверка на выход за пределы экрана снизу
  if (enemy.y + enemy.height > canvas.height) {
    enemy.y = canvas.height - enemy.height; // Возвращаем врага на "землю"
    enemy.isOnLadder = false;
    enemy.ladderDecisionMade = false;
  }
}

// Функция для получения платформы под персонажем
function getPlatformUnderneath(character) {
  for (let i = platforms.length - 1; i >= 0; i--) {
    const platform = platforms[i];
    if (
      character.x < platform.x + platform.width &&
      character.x + character.width > platform.x &&
      character.y + character.height <= platform.y &&
      character.y + character.height + character.gravity >= platform.y
    ) {
      return platform;
    }
  }
  return null;
}

// Функция для определения, находится ли персонаж на платформе
function isEnemyOnPlatform(enemy) {
  return platforms.some((platform) => {
    return (
      enemy.x + enemy.width > platform.x &&
      enemy.x < platform.x + platform.width &&
      enemy.y + enemy.height === platform.y
    );
  });
}
