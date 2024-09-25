import './App.css'
import Autocomplete from "./components/autocomplete";
import { currencies, currencies2 } from "./data/data";

function App() {

  return (
    <>
      <div className="absolute w-screen h-screen bg-grey-100 top-0 left-0 flex items-center justify-center text-gray-400">
        <div className="relative bg-white rounded-md p-5 max-w-md flex flex-col gap-5">
          <Autocomplete
            description="With description and custom results display"
            disabled={false}
            filterOptions={(options, inputValue) => {
              return options.filter((option) =>
                option.name.toLowerCase().includes(inputValue.toLowerCase()) || option.code.toLowerCase().includes(inputValue.toLowerCase())
              );
            }}
            label="Async Search"
            loading={true}
            multiple={true}
            onChange={(selectedData) => {
              console.log(selectedData)
            }}
            onInputChange={(inputValue) => {
              console.log(inputValue)
            }}
            options={currencies2}
            value={currencies2.slice(0,3)}
            renderOption={(option) => (
              <div className="flex flex-col items-center justify-start gap-2">
                <div className="text-gray-800 w-full">{option.flag} {option.name}</div>
                <div className="text-gray-500 text-sm w-full">Country: {option.code}</div>
              </div>
            )}
            placeholder="Type to begin searching" />

          <Autocomplete
            description="With description and custom results display"
            disabled={false}
            filterOptions={(options, inputValue) => {
              return options.filter((option) =>
                option.toLowerCase().includes(inputValue.toLowerCase())
              );
            }}
            label="Sync Search"
            loading={false}
            multiple={false}
            onChange={(selectedData) => {
              console.log(selectedData)
            }}
            onInputChange={(inputValue) => {
              console.log(inputValue)
            }}
            options={currencies}
            value='US Dollar'
            /* renderOption={(option) => (
              <div className="text-gray-800">{option}</div>
            )} */
            placeholder="Type to begin searching" />
        </div>

      </div>
    </>
  )
}

export default App
