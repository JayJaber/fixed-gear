import { useState, useEffect } from 'react';
import './App.css';
import logo from '/cog.png';

function App() {
  const [inputs, setInputs] = useState(() => {
    const savedInputs = localStorage.getItem('inputs');
    return savedInputs
      ? JSON.parse(savedInputs)
      : {
          chainring: null,
          cog: null,
          wheel: null,
          tire: null,
          unit: null,
        };
  });

  const { chainring, cog, wheel, tire, unit } = inputs;

  const limits = {
    chainring: { min: 41, max: 100 },
    cog: { min: 9, max: 23 },
  };

  const ratioThreshold = 0.05;

  const gcd = (a, b) => {
    while (b) {
      [a, b] = [b, a % b];
    }
    return a;
  };

  const gearRatio = chainring && cog ? chainring / cog : null;

  const skidPatches =
    chainring && cog
      ? (cog / gcd(chainring, cog)) * (chainring % 2 === 1 ? 2 : 1)
      : null;

  // BSD Lookup in mm
  const bsdLookup = {
    700: 622,
    650: 584,
    26: 559,
    20: 406,
  };

  // Accurate Gear Inches
  let gearInches = null;
  if (chainring && cog && wheel && tire && unit && bsdLookup[wheel]) {
    const tireMm = unit === 'mm' ? tire : tire * 25.4;
    const diameterMm = bsdLookup[wheel] + 2 * tireMm;
    const diameterInches = diameterMm / 25.4;
    gearInches = diameterInches * (chainring / cog);
  }

  const possibleCombinations = [];
  for (let i = limits.chainring.min; i <= limits.chainring.max; i++) {
    for (let j = limits.cog.min; j <= limits.cog.max; j++) {
      possibleCombinations.push({ chainring: i, cog: j });
    }
  }

  const similarRatios = possibleCombinations.filter(({ chainring, cog }) => {
    const ratio = chainring / cog;
    return gearRatio && Math.abs(ratio - gearRatio) < ratioThreshold;
  });

  useEffect(() => {
    const filtered = Object.fromEntries(
      Object.entries(inputs).filter(([, val]) => val !== null)
    );
    localStorage.setItem('inputs', JSON.stringify(filtered));
  }, [inputs]);

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setInputs({
      ...inputs,
      [key]: value === '' ? null : key === 'unit' ? value : +value,
    });
  };

  return (
    <>
      <nav className='navbar bg-body-tertiary mb-2'>
        <div className='container'>
          <a className='navbar-brand' href='#'>
            <img
              src={logo}
              alt='Logo'
              // width='30'
              height='24'
              className='d-inline-block align-text-top me-1'
            />
            Fixed Gear Calculator
          </a>
        </div>
      </nav>
      <div className='container'>
        <div className='row g-2'>
          <div className='col-12 col-lg-6'>
            {/* Chainring and Cog Inputs */}
            <div className='row g-0'>
              <div className='col'>
                <div className='form-floating'>
                  <input
                    type='number'
                    className='form-control rounded-0 rounded-start'
                    id='chainring'
                    placeholder='Chainring'
                    min={limits.chainring.min}
                    max={limits.chainring.max}
                    value={chainring ?? ''}
                    onChange={handleChange('chainring')}
                  />
                  <label htmlFor='chainring'>Chainring</label>
                </div>
              </div>
              <div className='col col-auto bg-light border-top border-bottom p-3 font-monospace'>
                /
              </div>
              <div className='col'>
                <div className='form-floating'>
                  <input
                    type='number'
                    className='form-control rounded-0 rounded-end'
                    id='cog'
                    placeholder='Cog'
                    min={limits.cog.min}
                    max={limits.cog.max}
                    value={cog ?? ''}
                    onChange={handleChange('cog')}
                  />
                  <label htmlFor='cog'>Cog</label>
                </div>
              </div>
            </div>
          </div>
          <div className='col-12 col-lg-6'>
            {/* Wheel Size and Tire Size Inputs */}
            <div className='row g-0 mb-2'>
              <div className='col'>
                <div className='form-floating'>
                  <select
                    className='form-control rounded-0 rounded-start'
                    value={wheel ?? ''}
                    onChange={handleChange('wheel')}
                    id='wheel'
                  >
                    <option value=''>Select wheel size</option>
                    <option value='700'>700c / 29"</option>
                    <option value='650'>650b / 27.5"</option>
                    <option value='26'>26"</option>
                    <option value='20'>20"</option>
                  </select>
                  <label htmlFor='wheel'>Wheel Size</label>
                </div>
              </div>
              <div className='col col-auto bg-light border-top border-bottom p-3 font-monospace'>
                x
              </div>
              <div className='col'>
                <div className='input-group'>
                  <div className='form-floating'>
                    <input
                      type='number'
                      className='form-control rounded-0'
                      id='tire'
                      placeholder='Tire'
                      value={tire ?? ''}
                      onChange={handleChange('tire')}
                    />
                    <label htmlFor='tire'>Tire Size</label>
                  </div>
                  <div className='form-floating'>
                    <select
                      className='form-control rounded-0 rounded-end'
                      id='unit'
                      value={unit ?? ''}
                      onChange={handleChange('unit')}
                    >
                      <option value=''>Select unit</option>
                      <option value='mm'>mm</option>
                      <option value='inch'>inch</option>
                    </select>
                    <label htmlFor='unit'>Unit</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <button className='btn btn-primary mb-2'>Save Setup</button> */}

        <ul className='list-group list-group-horizontal-sm mb-2'>
          <li className='list-group-item flex-fill'>
            <b>Ratio:</b> {gearRatio ? gearRatio.toFixed(2) : ''}
          </li>
          <li className='list-group-item flex-fill'>
            <b>Skid Patches:</b> {skidPatches ? skidPatches : ''}
          </li>
          <li className='list-group-item flex-fill'>
            <b>Gear Inches:</b> {gearInches ? gearInches.toFixed(2) : ''}
          </li>
        </ul>

        {/* Similar Ratios */}
        <ul className='list-group mb-3'>
          <li className='list-group-item fw-bold'>Similar Ratios</li>
          {similarRatios
            .sort((a, b) => a.chainring / a.cog - b.chainring / b.cog)
            .map((ratio) => {
              const isActive =
                ratio.chainring === chainring && ratio.cog === cog;
              const content = (
                <>
                  {ratio.chainring} / {ratio.cog} ={' '}
                  {(ratio.chainring / ratio.cog).toFixed(2)}
                </>
              );

              return isActive ? (
                <li
                  key={JSON.stringify(ratio)}
                  className='list-group-item active'
                  style={{ cursor: 'text' }}
                >
                  {content}
                </li>
              ) : (
                <button
                  key={JSON.stringify(ratio)}
                  type='button'
                  className='list-group-item list-group-item-action'
                  onClick={() =>
                    setInputs((prev) => ({
                      ...prev,
                      chainring: ratio.chainring,
                      cog: ratio.cog,
                    }))
                  }
                >
                  {content}
                </button>
              );
            })}
        </ul>
      </div>
    </>
  );
}

export default App;
