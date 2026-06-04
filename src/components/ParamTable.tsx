export default function ParamTable({
  tableData,
}: {
  tableData: { headers: { name: string; value: string }[]; rows: Record<string, string>[] };
}) {
  const returnRowValues = (row: Record<string, string>) => {
    const headers = tableData.headers;
    return headers.map((header) => row[header.value]);
  };

  const formatData = (data: string | boolean | number | Array<string>) => {
    let formatted;
    if (Array.isArray(data)) {
      formatted = data.join(', ');
    } else if (typeof data === 'boolean') {
      formatted = data ? 'yes' : 'no';
    } else {
      formatted = data;
    }
    return formatted;
  };

  return (
    <table className="w-full">
      <thead className="bg-muted">
        <tr className="text-primary">
          {tableData.headers.map((header) => (
            <td className="px-4 py-2 text-sm font-medium capitalize">{header.name}</td>
          ))}
        </tr>
      </thead>

      <tbody>
        {tableData.rows.map((row, index) => (
          <tr key={index}>
            {returnRowValues(row)
              .filter((row) => row !== undefined)
              .map((data) => (
                <td className="border-r border-slate-200 px-4 py-2 text-sm last:border-r-0">
                  {formatData(data)}
                </td>
              ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
