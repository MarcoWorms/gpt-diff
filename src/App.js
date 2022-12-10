import "./styles.css";
import { useState } from 'react'
import useLocalStorage from './hooks/useLocalStorage'
import { Configuration, OpenAIApi } from 'openai'
const Diff = require('diff');


const configureOpenai = apiKey => new OpenAIApi(
  new Configuration({ apiKey })
)

export default function App() {

  const [apiKey, setApiKey] = useLocalStorage("key", null)
  const [apiKeyTemp, setApiKeyTemp] = useState(null)

  const [input, setInput] = useState(null)
  const [instruction, setInstruction] = useState(null)
  const [response, setResponse] = useState(null)
  const [diff, setDiff] = useState(null)
  const [isRequesting, setIsRequesting] = useState(false)

  return (
    <div className="container">
      <h1>GPT DIFF</h1>
      <p>version: 0</p>
      {
        apiKey
          ? (
            <div className="screen-app">
              <textarea placeholder="input text" onChange={e => {
                setInput(e.target.value)
              }} />
              <textarea placeholder="instructions" onChange={e => {
                setInstruction(e.target.value)
              }} />
              <button disabled={isRequesting} onClick={async e => {
                setIsRequesting(true)
                const openai = configureOpenai(apiKey)
                const rawResponse = await openai.createEdit({
                  model: "text-davinci-edit-001",
                  input,
                  instruction,
                  temperature: 0.5,
                  top_p: 1,
                });
                setResponse(rawResponse.data.choices[0].text.trim())
                setDiff(Diff.diffChars(input, rawResponse.data.choices[0].text.trim()))
                setIsRequesting(false)
              }}>
                Run GPT3 and diff result!
              </button>
              <pre>
                {diff ? diff.map((part) => {
                  const color = part.added
                  ? 'green'
                  : part.removed
                  ? 'red'
                  : 'grey';
                  return <span style={{color}}>{part.value}</span>
                }) : <span style={{color:"grey"}}>diff</span>}
              </pre>
              <pre placeholder="raw output">
                {response || <span style={{color:"grey"}}>raw response</span>}
              </pre>
            </div>
          )
          : (
            <div className="screen-key">
              <br />
              <label for="key">GPT3 Key: </label>
              <input id="key" type="text" onChange={e =>
                setApiKeyTemp(e.target.value)
              } />
              <br />
              <button onClick={() => {
                setApiKey(apiKeyTemp)
              }}>Start!</button>
            </div>
          )
      }
    </div>
  );
}
