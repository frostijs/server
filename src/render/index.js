import react from './react';
import vanilla from './vanilla';

const renderTemplate = ({
  App, Helmet, template, library, req
}) => {
  let result;

  if (library === 'react') {
    result = react({
      App,
      Helmet,
      template,
      req
    });
  } else {
    result = vanilla({
      template
    });
  }

  return result;
};

export default renderTemplate;
