import { useEffect, useState } from 'react';
import ContentstackUIExtension from '@contentstack/ui-extensions-sdk';

import { Button, InstructionText } from '@contentstack/venus-components';

function App() {
  const [error, setError] = useState(null);
  const [extension, setExtension] = useState(null);
  const [locales, setLocales] = useState([]);
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    if (self === top) {
      setError({ message: 'This extension can only be used in the Contentstack' });
    } else {
      ContentstackUIExtension.init().then(extension => {
        setExtension(extension);
        console.log('Extension initialized', extension);
      });
    }
  }, []);

  useEffect(() => {
    if (extension) {

      setEntry(extension.entry.getData());

      extension.stack.getLocales().then(locales => {
        setLocales(locales.locales)
      })
    }
  }, [extension])

  if (error) {
    return <p>Error: {error.message}</p>
  }

  if (!extension) {
    return <p>Loading...</p>
  }

  const getTranslations = (fieldUid) => {
    if (extension) {
      console.log('getTranslations', extension);
      //locales[0].code
      const api_key="blt02b0f4733a07e2cf"
      const token="csd577949ac8927da28f0d3304"
      extension.stack.ContentType(extension.entry.content_type.uid).Entry(entry.uid).language("fr-fr").fetch().then(entry => {
        console.log(entry)
      })
    }

    return null
  }

  return (
    <div>
      <InstructionText>
        Select the locales to see
      </InstructionText>
      <Button>Hello World</Button>

      <div>
        Locale: {extension.entry.locale}
      </div>
      <div>
        Locales: {locales?.map(locale => locale.name + "("+locale.code+")").join(', ')}
      </div>

      {extension.entry
        ? extension.entry.content_type.schema.map(field => {
          return <div key={field.uid}>
            {field.display_name}
            <Button onClick={() => getTranslations(field.uid)}>See translations</Button>
          </div>
        })
        : "No Entry"
      }

    </div>
  );
}

export default App;
