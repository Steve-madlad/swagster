import { useParams } from "react-router-dom"
import registry from "../api-data/registry.json"

export default function ApiDoc() {
  const params = useParams();
  const api = registry.apis.find(api => api.id === params.name)

  console.log({params})

  return (
    <div className="p-5">
      <h1>{api?.name}</h1>
      <p>{api?.description}</p>
      
      <div className="mt-3 ">
        {
          api?.resources.map(group => {
            return <div className="space-y-2">
              <p>{group.groupName}</p>
              {group.endpoints.map(endpoint => 
                <div className="col">
                  <span>Description {endpoint.description}</span>
                  <span>Method {endpoint.method}</span>
                  <span>Path {endpoint.path}</span>
                </div>
              )}
            </div>           
          })
        }
      </div>
    </div>
  )
}
