<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;
use NotificationChannels\WebPush\WebPushChannel;

class TestPushNotification extends Notification
{
    use Queueable;

    private $userName;

    /**
     * Create a new notification instance.
     */
    public function __construct($userName)
    {
        $this->userName = $userName;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    /**
     * Get the web push representation of the notification.
     */
    public function toWebPush($notifiable, $notification)
    {
        return (new WebPushMessage())
            ->title('🔔 إشعار تجريبي من نبض')
            ->body('مرحباً ' . $this->userName . '! الإشعارات تعمل بنجاح 🎉')
            ->icon('/favicon.ico')
            ->badge('/favicon.ico')
            ->data([
                'type' => 'test',
                'timestamp' => now()->toISOString(),
                'user_id' => $notifiable->id,
            ])
            ->options([
                'TTL' => 3600, // ساعة واحدة
                'urgency' => 'normal',
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'test',
            'message' => 'إشعار تجريبي من نبض',
            'user_name' => $this->userName,
        ];
    }
}
