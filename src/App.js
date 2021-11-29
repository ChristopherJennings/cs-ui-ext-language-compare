import { useEffect, useState } from 'react';
import ContentstackUIExtension from '@contentstack/ui-extensions-sdk';

import { Button, Select } from '@contentstack/venus-components';

function App() {
  const [error, setError] = useState(null);
  const [extension, setExtension] = useState(null);

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

  if (error) {
    return <p>Error: {error.message}</p>
  }

  return (
    <div>
      <Button>Hello World</Button>

      <Select
        selectLabel="Select a field"
        onChange={e => {
          console.log(e);
        }}
        options={[
          {
            id: 0,
            label: 'Option 1',
            searchableLabel: 'ssssOption 1',
            value: 1
          },
          {
            id: 1,
            label: 'Option 2',
            searchableLabel: 'ssssOption 2',
            value: 2
          },
          {
            id: 2,
            label: 'Option 3',
            searchableLabel: 'ssssOption 3',
            value: 3
          }
        ]}
        value={null}
      />
    </div>
  );
}

export default App;
