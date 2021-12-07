import { useEffect, useState } from 'react';
import ContentstackUIExtension from '@contentstack/ui-extensions-sdk';
import './App.css'
import * as Utils from '@contentstack/utils'
import { InstructionText, Select, FieldLabel } from '@contentstack/venus-components';

function App() {
  const [error, setError] = useState(null);

  const [extension, setExtension] = useState(null);
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState("title");
  const [entryTranslations, setEntryTranslations] = useState([]);

  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    if (self === top) {
      setError({ message: 'This extension can only be used in the Contentstack' });
    } else {
      ContentstackUIExtension.init().then(extension => {
        setExtension(extension);
      });
    }
  }, []);

  useEffect(() => {
    if (extension && extension.entry) {
      const getEntryTranslations = async () => {
        const locales = (await extension.stack.getLocales()).locales;

        const otherLocales = locales.filter(locale => locale.code !== extension.entry.locale)

        const entryResults = otherLocales.map(locale => {
          return {
            locale: locale,
            entry: extension.stack
              .ContentType(extension.entry.content_type.uid)
              .Entry(extension.entry._data.uid)
              .language(locale.code)
              .fetch()
          }
        })

        const resolvedRequests = await Promise.all(entryResults.map(er => er.entry))
        resolvedRequests.forEach((resolvedRequest, i) => {
          entryResults[i].entry = resolvedRequest.entry
        })

        setEntryTranslations(entryResults)
      }

      const setupFields = async () => {
        const entryFields = extension.entry.content_type.schema
          .filter(f => {
            const isText = f.data_type === `text`
            const isJsonRte = f.data_type === `json` && f.field_metadata.allow_json_rte === true

            return isText || isJsonRte
          })
          .map((f, i) => ({
            id: i,
            label: f.display_name,
            value: f.uid
          }));
        setFields(entryFields);
        setSelectedField(entryFields[0]);
      }

      setupFields();
      getEntryTranslations();
    }
  }, [extension])

  if (error) {
    return <p>Error: {error.message}</p>
  }

  if (!extension) {
    return <p>Loading...</p>
  }

  return (
    <div>
      <div style={{ borderBottom: "0.5px dashed rgba(113,128,150,.2)", marginBottom: "1.375rem", paddingBottom: "1.5625rem" }}>
        <InstructionText>
          Select the field to see all translations
        </InstructionText>
        <Select
          onChange={setSelectedField}
          value={selectedField}
          options={fields}
        />
        {/* <select onChange={e => setSelectedField(JSON.parse(e.target.value))} value={selectedField}>
          {fields.map(f => <option key={f.value} value={JSON.stringify(f)}>{f.label}</option>)}
        </select> */}
      </div>
      {entryTranslations.map((et, i) => {
        const value = resolveValue()
        const text = et.locale.code === et.entry.locale ? value : `<p class="message">(uses fallback)</p>`
        return (
          <div key={i} style={{ borderBottom: "0.5px dashed rgba(113,128,150,.2)", marginBottom: "1.375rem", paddingBottom: "1.5625rem" }}>
            <FieldLabel htmlFor="" disabled>{selectedField.label} ({et.locale.name})</FieldLabel>
            <div className="output" dangerouslySetInnerHTML={{ __html: text }}>
            </div>
          </div>
        )

        function resolveValue() {
          let entry = et.entry
          const value = et.entry[selectedField.value];

          switch (typeof value) {
            case 'string':
              return value;
            case 'undefined':
            case 'null':
              return '<p class="message">(no value)</p>';
            case 'object':
              if (Array.isArray(value)) {
                return `<ul>${value.map((v, i) => `<li>${v}</li>`).join('')}</ul>`
              } else {
                Utils.jsonToHTML({ entry, paths: [selectedField.value] })
                return entry[selectedField.value]
              }
            default:
              return typeof value
          }
        }
      })}
    </div>
  );
}

export default App;
