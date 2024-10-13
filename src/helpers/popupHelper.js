const activeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <circle cx="12" cy="12" r="10" stroke="green" stroke-width="2" fill="none" />
  <path d="M10 12l2 2 4-4" stroke="green" stroke-width="2" fill="none" />
  <animate attributeType="CSS" attributeName="opacity" from="1" to="0" dur="1.5s" repeatCount="indefinite"/>
</svg>
`;

const inactiveSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <circle cx="12" cy="12" r="10" stroke="gray" stroke-width="2" fill="none" />
  <path d="M8 12h8" stroke="gray" stroke-width="2" fill="none" />
</svg>
`;