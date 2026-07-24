/**
 * Biblioteca de Estudios Teológicos Sistemáticos e Investigación para Genesis Explorer.
 * Carga directamente la base de datos descargada de La Biblia del Expositor (The Expositor's Bible)
 * y la Biblia Temática de Nave (Nave's Topical Bible).
 */

import genesisStudiesData from '../studies/genesis_studies.json';

const rawData = (genesisStudiesData && genesisStudiesData.default) ? genesisStudiesData.default : (genesisStudiesData || {});

export const THEOLOGICAL_STUDIES = rawData.studies || {};
export const LIBRARY_INFO = {
  source: rawData.library_source || 'La Biblia del Expositor (Marcus Dods) & Biblia Temática de Nave',
  edition: rawData.edition_info || 'Edición Teológica Evangélica Académica'
};
