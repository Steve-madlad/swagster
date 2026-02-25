import ParamTable from './ParamTable';

const ParameterSection = ({
  title,
  dataExists,
  tableData,
}: {
  title: string;
  dataExists: any;
  tableData: any;
}) => {
  if (!dataExists) return null;

  return (
    <div className="mb-6">
      <p className="font-medium text-slate-700">{title}</p>
      <div className="mt-2 overflow-x-auto overflow-y-hidden rounded-sm border border-slate-200">
        <ParamTable tableData={tableData} />
      </div>
    </div>
  );
};

export const EndpointRequestDetails = ({ selectedEndpoint }: { selectedEndpoint: any }) => {
  const request = selectedEndpoint?.request;

  const organizeTableData = (path: 'path' | 'query' | 'body') => {
    const keyMapping = {
      path: 'pathParams',
      query: 'queryParams',
      body: 'body',
    };

    const options = selectedEndpoint?.request?.[keyMapping[path]]?.find(
      (field: Record<string, any>) => field.enum !== undefined,
    );

    return {
      headers: [
        { name: 'name', value: 'name' },
        { name: 'type', value: 'type' },
        { name: 'required', value: 'required' },
        { name: 'description', value: 'description' },
        ...(options ? [{ name: 'options', value: 'enum' }] : []),
      ],
      rows: selectedEndpoint?.request?.[keyMapping[path]],
    };
  };

  const sections: {
    title: string;
    exists: Record<string, string>;
    type: 'path' | 'query' | 'body';
  }[] = [
    { title: 'Path Parameters', exists: request?.pathParams, type: 'path' },
    { title: 'Query Parameters', exists: request?.queryParams, type: 'query' },
    { title: 'Body Parameters', exists: request?.body, type: 'body' },
  ];

  return (
    <>
      {sections.map((section) => (
        <ParameterSection
          key={section.type}
          title={section.title}
          dataExists={section.exists}
          tableData={organizeTableData(section.type)}
        />
      ))}
    </>
  );
};
