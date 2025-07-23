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
      addButton: 'button#grid_1979692032_0_add',
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
      deleteButton: 'button#grid_1979692032_0_delete',
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
      statusOption: 'Generated', // Burada dropdown seçeneği olarak status'u belirttik
    },
    timeouts: {
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
      description: 'This is a test extractor.',
      isActive: 'Y',
      isRepeating: 'false', // Make sure this matches exactly what appears in the dropdown
      entityName: 'PO', // Make sure this matches exactly what appears in the dropdown
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
      descriptionInput: 'input#description',
      activeDropdownIcon: 'div.e-control-wrapper .e-ddl-icon',
      entitiesSection: '.e-acrdn-item:has-text("Entities")',
      entitiesAccordion: '.e-acrdn-item:has-text("Entities")',
      entitiesGrid: '.e-acrdn-item:has-text("Entities") .e-grid',
      entitiesAddButton: '.e-acrdn-item:has-text("Entities") .e-toolbar-item button.e-tbar-btn:has-text("Add")',
      mainSaveButton: 'button.submit-button:has-text("Save")',
      
      // Updated modal selectors based on the HTML structure
      entitiesModal: '.e-dialog.e-popup-open[role="dialog"]:has(.e-dlg-header:has-text("Add Entities"))',
      
      // Updated dropdown icon selectors based on the actual HTML structure
      entitiesModalIsRepeatingDropdownIcon: '#isRepeating ~ .e-input-group-icon.e-ddl-icon',
      entitiesModalEntityNameDropdownIcon: '#entityName ~ .e-input-group-icon.e-ddl-icon',
      
      // Popup selectors for dropdowns
      entitiesModalIsRepeatingPopup: '.e-popup-open ul.e-ul',
      entitiesModalEntityNamePopup: '.e-popup-open ul.e-ul',
      
      // Modal save button selector
      entitiesModalSaveButton: 'button.submit-button:has-text("Save")',
      
      // Additional field selectors for direct access if needed
      itemTypeInput: '#itemType',
      specialInstructionsInput: '#specialInstructions',
      itemIdentifierInput: '#itemIdentifier',
      batchSizeInput: '#batchSize',
      itemPatternsInput: '#itemPatterns',
      isRepeatingDropdown: '#isRepeating',
      entityNameDropdown: '#entityName',
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
      descriptionEditor: '#inplaceeditor_916125099_2', // Description editor selector
      descriptionEditorInput: '#rulesetDescription_editor', // Description input selector
      descriptionSaveButton: '.e-btn-save.e-lib.e-btn.e-control.e-icon-btn', // Save button selector for description
    },
    rulesetData: {
      rulesetName: 'Test Ruleset',
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
    baseUrl: 'https://demo.tradingdocs.ai', // Ana URL
    entityListPath: '/entity-list', // Entity List sayfasının yolu
    timeouts: {
      pageLoad: 3000, // Sayfa yüklenme zaman aşımı (ms)
      entityItemVisible: 2000, // Entity elemanının görünme zaman aşımı (ms)
      entityNavigation: 2000, // Entity arası geçiş zaman aşımı (ms)
      titleVisible: 2000, // Başlığın görünme zaman aşımı (ms)
      tableLoad: 2000, // Tablo yüklenme zaman aşımı (ms)
      dataLoad: 2000, // Veri yüklenme zaman aşımı (ms)
      betweenNavigations: 1000 // Entityler arası geçiş için bekleme süresi (ms)
    },
    validation: {
      checkUrl: true, // URL kontrolü yapılıp yapılmayacağı
      requireTitle: true, // Başlık kontrolü yapılıp yapılmayacağı
      requireTable: false, // Tablo kontrolü yapılıp yapılmayacağı
      allowEmpty: false // Tablo boş olup olmamasına izin verilip verilmeyeceği
    },
    selectors: {
      pageTitle: 'h1', // Sayfa başlığı seçici
      dataTable: 'table', // Tablo seçici
      tableRows: 'table tbody tr', // Tablo satırları seçici
      errorMessage: '.error-message', // Hata mesajı seçici
      loadingIndicator: '.loading-indicator' // Yüklenme göstergesi seçici
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