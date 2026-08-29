#!/usr/bin/env node
/**
 * Recalculates years of experience and rewrites README.md between markers.
 *
 * Edit only the dates below. Everything else stays as is.
 */

const fs = require('fs');
const path = require('path');

// ---- Edit these if your history changes -------------------------------
// Every name here MUST have matching markers in README.md, or the script
// fails loudly. That is deliberate: a silent no-op would let a typo sit
// there for a year without you noticing.
const START_DATES = {
  // Binary6, first React role
  'react-years': '2020-06-01',

  // Uncomment to also show total professional experience.
  // Add <!--START:career-years-->7<!--END:career-years--> to README.md first.
  // Jubilee Life Insurance, first professional role
  // 'career-years': '2019-07-01',
};
// -----------------------------------------------------------------------

const README = path.join(__dirname, '..', 'README.md');

/**
 * Completed years only. Nine years and eleven months returns 9, not 10.
 */
function completedYears(startISO) {
  const start = new Date(startISO + 'T00:00:00Z');
  const now = new Date();

  let years = now.getUTCFullYear() - start.getUTCFullYear();
  const monthGap = now.getUTCMonth() - start.getUTCMonth();

  if (monthGap < 0 || (monthGap === 0 && now.getUTCDate() < start.getUTCDate())) {
    years -= 1;
  }
  return years;
}

function replaceSection(content, name, value) {
  // No global flag: one marker pair per name, and test() stays stateless.
  const re = new RegExp(
    `(<!--\\s*START:${name}\\s*-->)[\\s\\S]*?(<!--\\s*END:${name}\\s*-->)`
  );

  if (!re.test(content)) {
    throw new Error(
      `Could not find <!--START:${name}--> ... <!--END:${name}--> in README.md`
    );
  }
  return content.replace(re, `$1${value}$2`);
}

function main() {
  const original = fs.readFileSync(README, 'utf8');
  let updated = original;

  for (const [name, startISO] of Object.entries(START_DATES)) {
    const years = completedYears(startISO);
    console.log(`${name}: ${years} (since ${startISO})`);
    updated = replaceSection(updated, name, String(years));
  }

  if (updated === original) {
    console.log('README already up to date.');
    return;
  }

  fs.writeFileSync(README, updated);
  console.log('README updated.');
}

main();
