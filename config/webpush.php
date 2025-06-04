<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Web Push VAPID Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure the VAPID keys for web push notifications.
    | These keys are used to identify your application to push services.
    |
    */

    'vapid' => [
        'subject' => env('VAPID_SUBJECT', 'mailto:admin@pulsse.app'),
        'public_key' => env('VAPID_PUBLIC_KEY'),
        'private_key' => env('VAPID_PRIVATE_KEY'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Web Push Notification Settings
    |--------------------------------------------------------------------------
    |
    | Configure default settings for web push notifications.
    |
    */

    'gcm' => [
        'key' => env('GCM_KEY'),
        'sender_id' => env('GCM_SENDER_ID'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Notification Options
    |--------------------------------------------------------------------------
    |
    | Default options that will be applied to all web push notifications
    | unless overridden in the notification itself.
    |
    */

    'defaults' => [
        'TTL' => 3600, // Time to live in seconds (1 hour)
        'urgency' => 'normal', // very-low, low, normal, high
        'topic' => null,
        'batchSize' => 1000,
    ],

    /*
    |--------------------------------------------------------------------------
    | WebPush Driver Settings
    |--------------------------------------------------------------------------
    |
    | The driver settings for web push notifications
    |
    */

    'table_name' => env('WEBPUSH_DB_TABLE', 'push_subscriptions'),
    'database_connection' => env('WEBPUSH_DB_CONNECTION', null),
];
