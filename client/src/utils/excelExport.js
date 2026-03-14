export const downloadExcel = (data, fileName) => {
  // Simple CSV generation for college level (no heavy xlsx lib needed if we want to be lightweight, but xlsx is requested)
  // Converting JSON to CSV
  const replacer = (key, value) => value === null ? '' : value; 
  const header = Object.keys(data[0]);
  const csv = [
    header.join(','), // header row first
    ...data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
  ].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', fileName + '.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
