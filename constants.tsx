
import React from 'react';
import { ModelData } from './types';

export const MODELS: ModelData[] = [
 
  {
    id: 'earth-seasons',
    title: 'Earth Seasons & Tilt',
    description: 'Investigate how Earth\'s fixed 23.5° axial tilt creates seasons. Observe the change in direct sunlight and day length throughout the yearly orbit.',
    category: 'Astrology',
    thumbnail: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450' style='background:%23020617'%3E%3Ccircle cx='400' cy='225' r='50' fill='%23fbbf24' filter='drop-shadow(0 0 30px %23fbbf24)'/%3E%3Cellipse cx='400' cy='225' rx='300' ry='100' fill='none' stroke='%23334155' stroke-width='2' stroke-dasharray='10,10'/%3E%3Cg transform='translate(650, 180)'%3E%3Cline x1='0' y1='-40' x2='0' y2='40' stroke='%2394a3b8' stroke-width='2' transform='rotate(23.5)'/%3E%3Ccircle cx='0' cy='0' r='20' fill='%233b82f6'/%3E%3Cpath d='M -20 0 A 20 20 0 0 0 20 0' fill='black' opacity='0.5' transform='rotate(23.5)'/%3E%3C/g%3E%3Cg transform='translate(150, 270)'%3E%3Cline x1='0' y1='-40' x2='0' y2='40' stroke='%2394a3b8' stroke-width='2' transform='rotate(23.5)'/%3E%3Ccircle cx='0' cy='0' r='20' fill='%233b82f6'/%3E%3Cpath d='M -20 0 A 20 20 0 0 0 20 0' fill='black' opacity='0.5' transform='rotate(23.5)'/%3E%3C/g%3E%3Ctext x='400' y='400' fill='%2394a3b8' font-family='sans-serif' font-size='14' font-weight='bold' text-anchor='middle' letter-spacing='2'%3ESEASONS LAB%3C/text%3E%3C/svg%3E",
    complexity: 'Medium'
  },
  {
    id: 'solar-system',
    title: 'Solar System Explorer',
    description: 'An interactive 3D journey through our celestial neighborhood. Click on planets to explore orbital data, physical characteristics, and learn more about our solar system.',
    category: 'Astrology',
    thumbnail: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450' style='background:%23020617'%3E%3Ccircle cx='400' cy='225' r='40' fill='%23fcd34d' filter='drop-shadow(0 0 20px %23fbbf24)'/%3E%3Ccircle cx='480' cy='225' r='10' fill='%2394a3b8'/%3E%3Ccircle cx='550' cy='225' r='15' fill='%233b82f6'/%3E%3Ccircle cx='650' cy='225' r='25' fill='%23ea580c'/%3E%3Ccircle cx='200' cy='100' r='2' fill='white' opacity='0.5'/%3E%3Ccircle cx='600' cy='350' r='2' fill='white' opacity='0.5'/%3E%3Cpath d='M 350 225 A 50 50 0 0 0 450 225' fill='none' stroke='white' stroke-opacity='0.1'/%3E%3Ctext x='400' y='350' fill='%2394a3b8' font-family='sans-serif' font-size='14' font-weight='bold' text-anchor='middle' letter-spacing='2'%3ESOLAR 3D%3C/text%3E%3C/svg%3E",
    complexity: 'Simple'
  },
  {
    id: 'barycenter-lab',
    title: 'Gravity Lab: Barycenter',
    description: 'Master the concept of the Center of Mass. Toggle between Reference Frames to see why the Earth "wobbles" and adjust mass to move the barycenter point.',
    category: 'Physics',
    thumbnail: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450' style='background:%23020617'%3E%3Cdefs%3E%3Cfilter id='glow'%3E%3CfeGaussianBlur stdDeviation='2.5' result='coloredBlur'/%3E%3CfeMerge%3E%3CfeMergeNode in='coloredBlur'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Ccircle cx='350' cy='225' r='40' fill='%233b82f6' stroke='%231d4ed8' stroke-width='2'/%3E%3Ccircle cx='550' cy='225' r='12' fill='%2394a3b8'/%3E%3Cpath d='M 350 225 L 550 225' stroke='white' stroke-width='1' stroke-dasharray='4,4' opacity='0.3'/%3E%3Ccircle cx='375' cy='225' r='4' fill='%23ef4444' filter='url(%23glow)'/%3E%3Cpath d='M 300 225 A 75 75 0 0 1 450 225' fill='none' stroke='%233b82f6' stroke-width='1' opacity='0.2'/%3E%3Ctext x='400' y='350' fill='%2394a3b8' font-family='sans-serif' font-size='14' font-weight='bold' text-anchor='middle' letter-spacing='2'%3EORBITAL MECHANICS%3C/text%3E%3C/svg%3E",
    complexity: 'Medium'
  },
  {
    id: 'concave-mirror',
    title: 'Mirror Lab',
    description: 'An interactive optical playground. Drag the object to observe real-time ray tracing, image formation, and magnification properties.',
    category: 'Physics',
    thumbnail: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450' style='background:%23020617'%3E%3Cdefs%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%231e293b' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='800' height='450' fill='url(%23grid)' /%3E%3Cline x1='0' y1='225' x2='800' y2='225' stroke='%23334155' stroke-width='2' stroke-dasharray='5,5'/%3E%3Cpath d='M 500 75 A 300 300 0 0 1 500 375' fill='none' stroke='%2394a3b8' stroke-width='4' /%3E%3Cpath d='M 505 75 A 300 300 0 0 1 505 375' fill='none' stroke='%2322d3ee' stroke-width='1' opacity='0.5' stroke-dasharray='4,4'/%3E%3Cline x1='300' y1='225' x2='300' y2='150' stroke='%23a855f7' stroke-width='4'/%3E%3Cpath d='M 290 160 L 300 150 L 310 160' fill='none' stroke='%23a855f7' stroke-width='4'/%3E%3Cline x1='300' y1='150' x2='500' y2='150' stroke='%23fbbf24' stroke-width='2' opacity='0.8'/%3E%3Cline x1='500' y1='150' x2='200' y2='300' stroke='%23fbbf24' stroke-width='2' opacity='0.6'/%3E%3Cline x1='300' y1='150' x2='500' y2='225' stroke='%233b82f6' stroke-width='2' opacity='0.8'/%3E%3Cline x1='500' y2='225' x2='200' y2='337.5' stroke='%233b82f6' stroke-width='2' opacity='0.6'/%3E%3Cline x1='375' y1='225' x2='375' y2='275' stroke='%232dd4bf' stroke-width='4'/%3E%3Cpath d='M 365 265 L 375 275 L 385 265' fill='none' stroke='%232dd4bf' stroke-width='4'/%3E%3Ctext x='300' y='245' fill='%23a855f7' font-family='sans-serif' font-weight='bold' font-size='14' text-anchor='middle'%3EOBJECT%3C/text%3E%3Ctext x='375' y='215' fill='%232dd4bf' font-family='sans-serif' font-weight='bold' font-size='14' text-anchor='middle'%3EIMAGE%3C/text%3E%3Ctext x='520' y='80' fill='%2394a3b8' font-family='sans-serif' font-weight='bold' font-size='14'%3EMIRROR%3C/text%3E%3C/svg%3E",
    complexity: 'Medium'
  },
  {
    id: 'thin-lens-lab',
    title: 'Thin Lens Lab',
    description: 'Master the physics of refraction. Switch between Convex and Concave lenses to observe light bending, focal points, and real vs. virtual image formation.',
    category: 'Physics',
    thumbnail: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450' style='background:%23020617'%3E%3Cdefs%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%231e293b' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='800' height='450' fill='url(%23grid)' /%3E%3Cline x1='0' y1='225' x2='800' y2='225' stroke='%23334155' stroke-width='2' stroke-dasharray='5,5'/%3E%3Cpath d='M 400 50 Q 440 225 400 400 Q 360 225 400 50 Z' fill='%231e293b' stroke='%2322d3ee' stroke-width='2' fill-opacity='0.3'/%3E%3Cline x1='400' y1='50' x2='400' y2='400' stroke='%2322d3ee' stroke-width='1' stroke-dasharray='4,4' opacity='0.5'/%3E%3Cline x1='200' y1='225' x2='200' y2='125' stroke='%23a855f7' stroke-width='4'/%3E%3Cpath d='M 190 135 L 200 125 L 210 135' fill='none' stroke='%23a855f7' stroke-width='4'/%3E%3Cline x1='200' y1='125' x2='400' y2='125' stroke='%23fbbf24' stroke-width='2' opacity='0.8'/%3E%3Cline x1='400' y1='125' x2='700' y2='275' stroke='%23fbbf24' stroke-width='2' opacity='0.6'/%3E%3Cline x1='200' y1='125' x2='600' y2='325' stroke='%233b82f6' stroke-width='2' opacity='0.8'/%3E%3Cline x1='600' y1='225' x2='600' y2='325' stroke='%232dd4bf' stroke-width='4'/%3E%3Cpath d='M 590 315 L 600 325 L 610 315' fill='none' stroke='%232dd4bf' stroke-width='4'/%3E%3Ctext x='200' y='245' fill='%23a855f7' font-family='sans-serif' font-weight='bold' font-size='14' text-anchor='middle'%3EOBJECT%3C/text%3E%3Ctext x='600' y='215' fill='%232dd4bf' font-family='sans-serif' font-weight='bold' font-size='14' text-anchor='middle'%3EIMAGE%3C/text%3E%3Ctext x='400' y='40' fill='%2322d3ee' font-family='sans-serif' font-weight='bold' font-size='14' text-anchor='middle'%3ELENS%3C/text%3E%3C/svg%3E",
    complexity: 'Medium'
  },
  {
    id: 'slinky-lab',
    title: 'Slinky Wave Lab',
    description: 'Explore wave mechanics in 3D. Switch between Longitudinal and Transverse modes to understand particle motion vs wave propagation.',
    category: 'Physics',
    thumbnail: "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450' style='background:%23020617'%3E%3Crect width='800' height='450' fill='%23020617'/%3E%3Cpath d='M 100 225 Q 125 180 150 225 Q 175 270 200 225 Q 225 180 250 225 Q 275 270 300 225 Q 325 180 350 225' fill='none' stroke='%2322d3ee' stroke-width='4' stroke-linecap='round'/%3E%3Ccircle cx='100' cy='225' r='8' fill='%23a855f7'/%3E%3Ctext x='400' y='350' fill='%2394a3b8' font-family='sans-serif' font-size='16' font-weight='bold' text-anchor='middle' letter-spacing='2'%3EWAVE PHYSICS%3C/text%3E%3C/svg%3E",
    complexity: 'Simple'
  }
];

export const ICONS = {
  Play: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
  ),
  Info: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
  ),
  Back: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
  ),
  Activity: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
  )
};
