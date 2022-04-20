/* bender-tags: editor */
/* bender-ckeditor-plugins: clipboard */
/* bender-include: _helpers/pasting.js */
/* globals mockFileReader, assertImagePaste */

( function() {
	'use strict';

	var originalFileReader = window.FileReader;

	var config = {
		allowedContent: true,
		language: 'en'
	};

	bender.editors = {
		classic: {
			config: config
		},
		inline: {
			creator: 'inline',
			config: config
		}
	};

	var tests = {
		setUp: function() {
			if ( !CKEDITOR.plugins.clipboard.isCustomDataTypesSupported ) {
				assert.ignore();
			}

			mockFileReader();

			for ( var name in this.editors ) {
				this.editors[ name ].focus();
			}
		},

		tearDown: function() {
			window.FileReader = originalFileReader;

			for ( var name in this.editors ) {
				this.editors[ name ].config.clipboard_disableNotification = false;
				this.editors[ name ].config.clipboard_ignoreNotificationsForImages = false;
				this.editors[ name ].config.clipboard_ignoreNotificationsForNonImages = false;
				this.editors[ name ].config.clipboard_ignoreNotificationsForExtensions = [];
			}
		},

		'test pasting unsupported file extension shows notification': function( editor ) {
			assertPasteFile( editor, 'application/pdf', 1 );
		},

		'test pasting unsupported file extension do not shows notification when they are disabled': function( editor ) {
			editor.config.clipboard_disableNotification = true;

			assertPasteFile( editor, 'application/zip', 0 );
		},

		'test pasting unsupported image extension do not shows notification when notifications are disabled and ignoring notifications for unsupported images is enabled': function( editor ) {
			editor.config.clipboard_disableNotification = true;
			editor.config.clipboard_ignoreNotificationsForImages = false;

			assertPasteFile( editor, 'application/jp2', 0 );
		},

		'test pasting unsupported file extension do not shows notification when notifications are disabled and ignoring notifications for unsupported non-images is enabled': function( editor ) {
			editor.config.clipboard_disableNotification = true;
			editor.config.clipboard_ignoreNotificationsForNonImages = false;

			assertPasteFile( editor, 'application/zip', 0 );
		},

		'test pasting unsupported file extension do not shows notification when notifications are disabled and ignoring notifications for specific unsupported extensions is enabled': function( editor ) {
			editor.config.clipboard_disableNotification = true;
			editor.config.clipboard_ignoreNotificationsForExtensions = [ 'pdf' ];

			assertPasteFile( editor, 'application/pdf', 0 );
		},

		// jscs:disable maximumLineLength
		'test pasting unsupported image extension shows notification when ignoring notifications for non-images is enabled and ignoring notifications for unsupported image extensions is disabled': function( editor ) {
			editor.config.clipboard_ignoreNotificationsForImages = false;
			editor.config.clipboard_ignoreNotificationsForNonImages = true;

			assertPasteFile( editor, 'image/webp', 1 );
		},

		// jscs:disable maximumLineLength
		'test pasting unsupported file extension shows notification when ignoring notifications for non-images is disabled and ignoring notifications for unsupported image extensions is enabled': function( editor ) {
			editor.config.clipboard_ignoreNotificationsForImages = true;
			editor.config.clipboard_ignoreNotificationsForNonImages = false;

			assertPasteFile( editor, 'application/pdf', 1 );
		},

		'test pasting unsupported file extension do not shows notification when ignoring notifications for images and non-images are enabled': function( editor ) {
			editor.config.clipboard_ignoreNotificationsForImages = true;
			editor.config.clipboard_ignoreNotificationsForNonImages = true;

			assertPasteFile( editor, 'application/pdf', 0 );
		},

		'test pasting unsupported image extension do not shows notification when ignoring notifications for images and non-images are enabled': function( editor ) {
			editor.config.clipboard_ignoreNotificationsForImages = true;
			editor.config.clipboard_ignoreNotificationsForNonImages = true;

			assertPasteFile( editor, 'image/webp', 0 );
		},

		'test pasting unsupported image extension do not shows notification when ignoring notifications for images is disabled': function( editor ) {
			editor.config.clipboard_ignoreNotificationsForImages = true;

			assertPasteFile( editor, 'image/webp', 0 );
		},

		'test pasting unsupported file extension do not shows notification when ignoring notifications for non-images is disabled': function( editor ) {
			editor.config.clipboard_ignoreNotificationsForNonImages = true;

			assertPasteFile( editor, 'application/pdf', 0 );
		},

		'test pasting unsupported file extension do not shows notification when ignoring notifications for specific extensions is disabled': function( editor ) {
			editor.config.clipboard_ignoreNotificationsForExtensions = [ 'pdf' ];

			assertPasteFile( editor, 'application/pdf', 0 );
		},

		'test pasting unsupported image extension shows notification when ignoring notifications for non-images is disabled': function( editor ) {
			editor.config.clipboard_ignoreNotificationsForNonImages = false;

			assertPasteFile( editor, 'image/webp', 1 );
		},

		'test pasting unsupported file extension shows notification when ignoring notifications for images is disabled': function( editor ) {
			editor.config.clipboard_ignoreNotificationsForImages = false;

			assertPasteFile( editor, 'image/webp', 1 );
		}
	};

	function assertPasteFile( editor, fileType, expectedNotificationCount ) {
		var notificationSpy = sinon.spy( editor, 'showNotification' ),
			options = {
				type: fileType,
				expected: '<p>Paste file here:^@</p>',
				callback: function() {
					notificationSpy.restore();

					assert.areSame( expectedNotificationCount, notificationSpy.callCount,
						'Expected notification call count is incorrect' );
				}
			};

		FileReader.setFileMockType( fileType );
		FileReader.setReadResult( 'load' );

		bender.tools.selection.setWithHtml( editor, '<p>Paste file here:{}</p>' );

		assertImagePaste( editor, options );
	}

	tests = bender.tools.createTestsForEditors( CKEDITOR.tools.object.keys( bender.editors ), tests );

	bender.test( tests );
} )();
