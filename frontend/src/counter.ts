// Holdover de pure .ts template
// Het probleem met de pure .ts template is dat al je Html als string gedefineerd moet worden
// Deze string zou dan vol met Object references zitten waarbij je niet weet of ze correct zijn, tot ze zijn compiled
// Vandaar mijn voorkeur om .tsx te gebruiken gezien de korte tijd voor het prototype
export function setupCounter(element: HTMLButtonElement) {
  let counter = 0
  const setCounter = (count: number) => {
    counter = count
    element.innerHTML = `count is ${counter}`
  }
  element.addEventListener('click', () => setCounter(counter + 1))
  setCounter(0)
}
