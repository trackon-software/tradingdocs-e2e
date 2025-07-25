module.exports = {
  login: {
    baseUrl: 'https://demo.tradingdocs.ai',
    loginPath: '/login',
    homePath: '/',
    selectors: {
      emailInput: 'input[name="email"]',
      passwordInput: 'input[name="password"]',
      submitButton: 'button[type="submit"]',
    },
    timeouts: {
      navigation: 10000,
      postLoginRedirect: 10000,
    },
  },
  shipment: {
    baseUrl: 'https://demo.tradingdocs.ai',
    shipmentsPath: '/shipments',
    selectors: {
      addButton: 'button[aria-label="Add"]',
      modal: '.e-dialog.e-popup-open[role="dialog"]',
      shipmentIdInput: 'input#shipmentId',
      shipperInput: 'input#shipper',
      consigneeInput: 'input#consignee',
      statusDropdownIcon: '.e-input-group-icon.e-ddl-icon.e-search-icon',
      statusPopup: '#status_popup',
      statusOptionGenerated: '#status_popup .e-list-item',
      blNumberInput: 'input#blNumber',
      commodityInput: 'input#commodity',
      originPortInput: 'input#originPort',
      destinationPortInput: 'input#destinationPort',
      vesselNameInput: 'input#vesselName',
      shipmentDateInput: 'input#shipmentDate',
      etdInput: 'input#etd',
      etaInput: 'input#eta',
      bookingNumberInput: 'input#bookingNumber',
      referenceInput: 'input#reference',
      saveButton: 'button:has-text("Save")',
      editButton: 'button#grid_1979692032_0_edit',
      updateButton: 'button.update-shipment-data',
      shipmentSavedPopupSelector: 'div.e-alert-dialog.e-popup-open',
      shipmentSavedPopupOkButtonSelector: 'button.predefined-dialog',
      shipmentSavedPopupSuccessMessageSelector: 'div.dialog-text > h2',
      deleteButton: 'div.e-toolbar-item[title="Delete"] button:has-text("Delete")',
      deleteConfirmPopup: 'div.e-dialog.e-popup-open[role="dialog"]',
      deleteConfirmOkButton: 'div.e-footer-content button.e-primary:has-text("OK")',
      gridRowCheckbox: 'div.e-gridcontent tbody tr.e-row td .e-checkselect',
      confirmDeletePopup: '.e-confirm-dialog.e-popup-open',
      confirmDeleteButton: '.e-confirm-dialog.e-popup-open .e-footer-content button.e-primary',
    },
    data: {
      shipmentId: 'TEST-001',
      shipper: 'Test Shipper',
      consignee: 'Test Consignee',
      blNumber: 'BL123456',
      newBLNumber: 'BL654321',
      commodity: 'Steel',
      originPort: 'Istanbul',
      destinationPort: 'Dubai',
      vesselName: 'Black Pearl',
      shipmentDate: '07/15/2025',
      etd: '07/15/2025',
      eta: '07/25/2025',
      bookingNumber: 'BOOK1234',
      reference: 'Test Reference',
      expectedSuccessText: 'Success',
      statusOption: 'Generated', // Here we specify 'status' as a dropdown option
    },
    timeouts: {
      generalWait: 500,
      saveProcessing: 1000,
      pageLoad: 10000,
      buttonVisible: 5000,
      modalVisible: 5000,
      inputVisible: 5000,
      statusPopupVisible: 5000,
      statusOptionVisible: 5000,
      modalOpen: 10000,
      modalClose: 10000,
      shipmentSavedPopupTimeout: 10000,
    },
  },
  extractors: {
  baseUrl: 'https://demo.tradingdocs.ai/extractors',
  data: {
    extractorName: 'Test Extractor',
    updatedExtractorName: 'Updated Extractor', // Used in updateExtractor
    description: 'This is a test extractor.',
    isActive: 'Y',
    isRepeating: 'false',
    entityName: 'PO',
    itemType: 'Sample Item',
    specialInstructions: 'Handle with care',
    itemIdentifier: 'ID-12345',
    batchSize: 10,
    itemPatterns: 'pattern1, pattern2',
  },
  selectors: {
    pageTitle: 'h3.page-title',
    addButton: 'button.e-tbar-btn:has-text("Add")',
    extractorNameInput: 'input#extractorName',
    extractorNameEditor: '.full-width-inline-editor:has(small:text("Extractor Name")) .e-inplaceeditor',
    extractorNamePopupInput: '.e-tooltip-wrap.e-popup-open input#extractorName_editor',
    extractorNameSaveButton: '.e-tooltip-wrap.e-popup-open .e-btn-save',
    extractorPopupTooltip: '.e-tooltip-wrap.e-popup-open', // For waiting states
    extractorRowByTitle: (name) => `tr.e-row:has(td[title="${name}"])`, // Dynamic selector
    descriptionInput: 'input#description',
    activeDropdownIcon: 'div.e-control-wrapper .e-ddl-icon',
    entitiesSection: '.e-acrdn-item:has-text("Entities")',
    entitiesAccordion: '.e-acrdn-item:has-text("Entities")',
    entitiesGrid: '.e-acrdn-item:has-text("Entities") .e-grid',
    entitiesAddButton: '.e-acrdn-item:has-text("Entities") .e-toolbar-item button.e-tbar-btn:has-text("Add")',
    mainSaveButton: 'button.btn-primary:has-text("Update Extractor")',
    deleteButton: 'button[id*="delete"]:has-text("Delete")',
    editButton: 'div.e-toolbar-item[title="Edit"] > button.e-tbar-btn[aria-disabled="false"]',
    confirmDeletePopup: '.e-confirm-dialog.e-popup-open',
    confirmDeleteButton: '.e-confirm-dialog.e-popup-open .e-footer-content button.e-primary',
    successMessage: '.e-alert-dialog.e-popup-open .e-dlg-content',
  },
  timeouts: {
    accordionExpand: 2000,
    addButtonVisible: 5000,
    navigation: 10000,
    dropdown: 10000,
    input: 5000,
    modal: 15000,
    pageLoad: 10000,
    modalOpen: 5000,
    buttonVisible: 5000,
    inlineEditorWait: 2000, // For inline editor loading
    saveProcessing: 1000, // For save operations
    editModeActivation: 1000, // For edit mode activation
    generalWait: 500, // For general waits
    browserPopup: 3000, // For browser alert/confirm dialogs
  },
},
  ruleset: {
    baseUrl: 'https://demo.tradingdocs.ai',
    rulesetsPath: '/rulesets',
    selectors: {
      pageTitle: 'text=Rulesets',
      addButton: '.e-tbar-btn:has-text("Add")',
      editButton: 'button#grid_1216849542_0_edit',
      rulesetNameInput: '#rulesetName',
      rulesetDescriptionInput: '#rulesetDescription',
      commodityInput: '#commodity',
      destinationCountryInput: '#destinationCountry',
      originCountryInput: '#originCountry',
      effectiveDateInput: '#effectiveDate',
      rulesetSourceInput: '#rulesetSource',
      rulesInput: '#rules',
      rulesetTypeDropdownIcon: '#rulesetType ~ .e-input-group-icon.e-ddl-icon',
      rulesetTypePopup: '#rulesetType_popup',
      rulesetTypeListItem: '#rulesetType_popup .e-list-item',
      metadataAccordion: '.e-acrdn-header:has-text("Metadata")',
      isActiveDropdown: '#isActive',
      isActiveDropdownIcon: '#isActive ~ .e-input-group-icon.e-ddl-icon',
      isActivePopup: '#isActive_popup',
      isActiveListItem: '#isActive_popup .e-list-item',
      isActiveYOption: '#isActive_popup .e-list-item:has-text("Y")',
      saveButton: 'button.e-edit-dialog.submit-button',
      successText: 'text=Test Ruleset',
      deleteButton: 'div[title="Delete"] button',
      deleteConfirmPopup: '#confirmPopup',
      deleteConfirmOkButton: 'div.e-confirm-dialog.e-popup-open div.e-footer-content button.e-primary:has-text("OK")',
      tableRow: 'div.e-gridcontent tr.e-row',
      
      // ✅ RULESET NAME INLINE EDITOR (like updateExtractor pattern)
      rulesetNameEditor: '.full-width-inline-editor:has(small:text("Ruleset Name")) .e-inplaceeditor',
      rulesetNamePopupInput: '.e-tooltip-wrap.e-popup-open input#rulesetName_editor',
      rulesetNameSaveButton: '.e-tooltip-wrap.e-popup-open .e-btn-save',
      rulesetPopupTooltip: '.e-tooltip-wrap.e-popup-open', // For waiting states
      rulesetRowByTitle: (name) => `tr.e-row:has(td[title="${name}"])`, // Dynamic selector
      
      updateButton: 'button.btn-primary:has-text("Update Ruleset")', // Added missing selector
    },
    rulesetData: {
      rulesetName: 'Test Ruleset',
      updatedRulesetName: 'Updated Ruleset', // NEW - for updateRuleset
      rulesetDescription: 'Automatically created via Playwright',
      commodity: 'Steel',
      destinationCountry: 'UAE',
      originCountry: 'Turkey',
      effectiveDate: '07/14/2025',
      rulesetSource: 'Auto Test',
      rules: 'IF commodity == "Steel" THEN apply tax',
      rulesetTypeOption: 'Commodity',
      isActiveOption: 'Y',
    },
    timeouts: {
      pageLoad: 10000,
      formVisible: 5000,
      inputVisible: 5000,
      buttonVisible: 5000,
      inputFillDelay: 100,
      beforeDropdownSelection: 500,
      dropdownVisible: 5000,
      dropdownSettle: 500,
      beforeAccordion: 500,
      accordionAnimation: 500,
      beforeSave: 300,
      successVisible: 10000,
      navigation: 10000,
      selector: 5000,
      inlineEditorWait: 2000, // For inline editor loading
      saveProcessing: 1000, // For save operations
      editModeActivation: 1000, // For edit mode activation
      generalWait: 500, // For general waits
    },
  },
  entityBuilder: {
    baseUrl: 'https://demo.tradingdocs.ai',
    path: '/entity-builder',
    selectors: {
      pageTitle: 'h4.modal-title',
      tableRows: 'div[role="row"].e-row',
      modal: '.modal-dialog.modal-dialog-centered',
      modalTitle: 'h4.modal-title:has-text("Select Entity Type")',
      headerRadio: 'input#headerEntity',
      detailRadio: 'input#detailEntity',
      continueButton: 'button.btn.btn-primary:has-text("Continue")',
      entityBuilderTitle: '.card .card-header h4.card-title:has-text("Entity Builder")',
      dataTable: 'table.datatable.table.table-stripped',
      dataTableRows: 'table.datatable.table.table-stripped tbody tr',
      createEntityButton: 'button.btn.btn-success:has-text("Create Entity")',
      addAttributeButton: 'a.btn.btn-primary.next:has-text("Add Attribute")',
    },
    texts: {
      modalTitleText: 'Select Entity Type',
      entityBuilderPageTitle: 'Entity Builder',
      continueButtonText: 'Continue',
      createEntityButtonText: 'Create Entity',
      addAttributeButtonText: 'Add Attribute',
    },
    timeouts: {
      pageLoad: 10000,
      rowsLoad: 7000,
      modalOpen: 10000,
      modalClose: 10000,
      buttonVisible: 5000,
      tableVisible: 7000,
    },
  },

  entityList: {
    baseUrl: 'https://demo.tradingdocs.ai',
    entityListPath: '/entity-list',
    timeouts: {
      pageLoad: 3000,
      entityItemVisible: 2000,
      entityNavigation: 2000,
      titleVisible: 2000,
      tableLoad: 2000,
      dataLoad: 2000,
      betweenNavigations: 1000
    },
    validation: {
      checkUrl: true,
      requireTitle: true,
      requireTable: true,
      allowEmpty: true
    },
    selectors: {
      pageTitle: 'h1',
      dataTable: 'table',
      tableRows: 'table tbody tr',
      errorMessage: '.error-message',
      loadingIndicator: '.loading-indicator'
    },
    entities: [
      {
        name: 'Agent_usage',
        selector: '#_AGENT_USAGE',
        url: '/agent-usage',
        expectedTitle: 'Agent Usage'
      },
      {
        name: 'Child_document',
        selector: '#_CHILD_DOCUMENT',
        url: '/child-document',
        expectedTitle: 'Child Document'
      },
      {
        name: 'Company',
        selector: '#_COMPANY',
        url: '/company',
        expectedTitle: 'Company'
      },
      {
        name: 'Document',
        selector: '#_DOCUMENT',
        url: '/document',
        expectedTitle: 'Document'
      },
      {
        name: 'Ruleset',
        selector: '#_RULESET',
        url: '/ruleset',
        expectedTitle: 'Ruleset'
      }
    ]
  }
};
