export function chalkToHtml(chalk: string) {
  // Escape HTML characters
  let output = chalk.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/ /g, '&nbsp;')
    .replace(/\n/g, '<br />')
    // Table support
    .replace(/┌/g, '<br />┌')

  // Add Chalk Formatting
  output = output.replace(/\[31m/g, "<span style='color: red'>");
  output = output.replace(/\[32m/g, "<span style='color: green'>");
  output = output.replace(/\[33m/g, "<span style='color: yellow'>");
  output = output.replace(/\[34m/g, "<span style='color: blue'>");
  output = output.replace(/\[35m/g, "<span style='color: purple'>");
  output = output.replace(/\[36m/g, "<span style='color: cyan'>");
  output = output.replace(/\[37m/g, "<span style='color: white'>");
  output = output.replace(/\[39m/g, "</span>");
  output = output.replace(/\[90m/g, "<span style='color: gray'>");
  output = output.replace(/\[91m/g, "<span style='color: red'>");
  output = output.replace(/\[92m/g, "<span style='color: green'>");
  output = output.replace(/\[93m/g, "<span style='color: yellow'>");
  output = output.replace(/\[94m/g, "<span style='color: blue'>");
  output = output.replace(/\[95m/g, "<span style='color: purple'>");
  output = output.replace(/\[96m/g, "<span style='color: cyan'>");
  output = output.replace(/\[97m/g, "<span style='color: white'>");
  output = output.replace(/\[98m/g, "<span style='color: black'>");
  output = output.replace(/\[99m/g, "<span style='color: gray'>");
  output = output.replace(/\[30m/g, "<span style='color: gray'>");

  return output;
}